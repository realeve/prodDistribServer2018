const db = require("./db_image_judge");
const R = require("ramda");
const { dev } = require("../../util/axios");
const moment = require("moment");

module.exports.dev = dev;

// 图核判废接口

// 100条以内不重排
let endNum = 50;
const totalTryTimes = 50;

// 数组随机排序，如果某次排产结果不佳，通过随机乱序可生成更佳结果
const randomArr = (arr) => arr.sort(() => Math.random() - 0.5);

// 过滤为全检及核查品
const getTaskList = async ({ tstart, tend, prod }) => {
  // 印码印完后判废
  // let method = prod ? 'getViewCartfinderByProd' : 'getViewCartfinder';

  // 丝印印完后判废
  let method = prod ? "getVCbpcCartlistByProd" : "getVCbpcCartlist";

  let params = prod ? { tstart, tend, prod } : { tstart, tend };
  let { data } = await db[method](params);

  // 产品列表
  // console.log(method, params, data.length);

  let siyinCarts = [],
    codeCarts = [];

  // 2019，从MES查询出的丝印还没有工艺信息，需要统计的丝印品
  // 0 为不分工艺，丝印品此时不分工艺
  siyinCarts = R.compose(
    R.uniq,
    R.pluck("cart_number"),
    R.filter((item) => ["0"].includes(item.proc_name)) //R.propEq('proc_name', '不分工艺')
  )(data);
  // 不分工艺: 全检品

  // 1,2 为分工艺，印码品
  codeCarts = R.compose(
    R.uniq,
    R.pluck("cart_number"),
    R.filter((item) => ["2", "1"].includes(item.proc_name)) //R.propEq('proc_name', '码后核查'))
  )(data);
  // console.log(data);
  // m97全检品，需要判丝印
  // console.log("siyinCarts", siyinCarts.slice(0, 20));
  // 码后品，只判票面
  // console.log("codeCarts", codeCarts.slice(0, 20));
  return { siyinCarts, codeCarts, data };
};

// 过滤未上传车号
const getUnUploadCarts = ({ srcData, uploadData }) => {
  let uploadCarts = R.map(R.prop("cart_number"))(uploadData);
  let unUploadCarts = R.reject(({ cart_number }) =>
    uploadCarts.includes(cart_number)
  )(srcData);
  return unUploadCarts;
};

// 汇总列数据
const calcTotalData = (key, data) =>
  R.compose(R.reduce(R.add, 0), R.map(R.prop(key)))(data);

// 汇总任务数汇总
const getTaskBaseInfo = async ({ user_list, uploadData, tstart, tend }) => {
  // 汇总缺陷总数
  let totalFakes = calcTotalData("pf_num", uploadData);

  tstart = moment(tstart).startOf("month").format("YYYYMMDD");
  tend = moment(tend).endOf("month").format("YYYYMMDD");

  // 月度判废量
  let pfNumByMonth = await db
    .getQfmWipProdLogs({
      tstart,
      tend,
      tstart2: tstart,
      tend2: tend,
      tstart3: tstart,
      tend3: tend,
      tstart4: tstart,
      tend4: tend,
    })
    .catch((e) => {
      console.log(e);
    });

  // 汇总工时总数
  let totalWorkLongTime = calcTotalData("work_long_time", user_list);
  if (totalWorkLongTime == 0) {
    return [];
  }
  // 每单位判废条数
  let fakePerWorker = totalFakes / totalWorkLongTime;

  // 每单位大万数
  let cartsPerWorker = uploadData.length / totalWorkLongTime;

  let users = R.clone(user_list);
  users = randomArr(users);

  return users.map((item) => {
    let userPfNum = R.filter(R.propEq("operator_name", item.user_name))(
      pfNumByMonth
    );
    let cart_nums = 0,
      pf_num = 0;
    if (userPfNum.length) {
      cart_nums = userPfNum[0].cart_nums;
      pf_num = userPfNum[0].pf_num;
    }
    item = Object.assign(item, {
      expect_num: parseInt(item.work_long_time * fakePerWorker),
      expect_carts: parseFloat(
        (item.work_long_time * cartsPerWorker).toFixed(2)
      ),
      real_num: 0,
      carts_num: 0,
      delta_num: 0, // 当前条数与期望条数的差值
      month: {
        cart_nums,
        pf_num,
      },
      data: [],
      success: false,
      user_no: item.user_no,
      prod7: 0, //7T品大万数
    });

    return item;
  });
};

// 首次分配任务
const distribTasks = ({ users, uploadData, ascend }) => {
  if (uploadData.length == 0) {
    return { users, uploadData };
  }
  // 对uploadData排序
  // if (ascend) {
  //   uploadData = R.sort(R.ascend(R.prop('pf_num')))(uploadData);
  // } else {
  //   uploadData = R.sort(R.descend(R.prop('pf_num')))(uploadData);
  // }

  // 随机排列，保证每次排产结果有差异
  uploadData = randomArr(uploadData);

  // 用户信息更新
  users = R.map((curUser) => {
    // 如果完成了，继续
    if (curUser.success || uploadData.length == 0) {
      return curUser;
    }
    // 取第一项数据
    let head = R.head(uploadData);

    // 待排活数据删除一项
    uploadData = R.tail(uploadData);
    let { real_num, expect_num, carts_num, expect_carts } = curUser;
    // 更新当前状态
    real_num = real_num + head.pf_num;
    carts_num = carts_num + 1;
    let delta_num = real_num - expect_num;
    let data = [...curUser.data, head];
    let finished = Math.abs(delta_num) <= endNum;

    // 条数在100条以内或超过指定条数或超过指定万数时，当前人物停止排活
    let success = finished || delta_num >= 0; // || carts_num - expect_carts >= 0;
    return Object.assign(curUser, {
      real_num,
      carts_num,
      delta_num,
      data,
      success,
      finished,
    });
  })(users);

  return distribTasks({
    users,
    uploadData,
    ascend: !ascend,
  });
};

// 更优方案中各大万的判废量情况；
const getExpectedPFNum = (user) =>
  R.map((item) => {
    item.pf_num = item.pf_num - user.delta_num;
    return item;
  })(user.data);

const updateStatData = (user) => {
  // 汇总缺陷总数
  user.real_num = calcTotalData("pf_num", user.data);
  user.delta_num = user.real_num - user.expect_num;
  user.prod7 = user.data.filter(
    (item) => item.product_name == "9607T" && item.type == 0
  ).length;
  return user;
};

// 交换车号
const exchangeCarts = (task_list, try_times = 0) => {
  // console.log(`第${try_times}次循环:`);
  if (try_times >= totalTryTimes) {
    return task_list;
  }
  let changeFlag = false;
  // 根据与期望值的差值做排序
  // let users = R.sort(R.ascend(R.prop('delta_num')))(task_list);
  // 用户随机排序
  let users = randomArr(task_list);

  let len = users.length;
  for (let i = 0; i < len; i++) {
    let user = R.clone(users[i]);
    let isCurIdxChanged = false;

    // 更新finished状态
    if (Math.abs(user.delta_num) < endNum) {
      users[i] = user;
      continue;
    }

    // let curData = getExpectedPFNum(user);
    let curDirection = user.delta_num > 0;

    // 与前序数据逆向对比，当前组如果差值为负表示缺少判废数量，同正值（多出判废数量）的车号更换
    for (let j = len - 1; j > 0; j--) {
      if (i == j) {
        continue;
      }
      let nextUser = R.clone(users[j]);
      let nextDirection = nextUser.delta_num && nextUser.delta_num > 0;

      if (Math.abs(nextUser.delta_num) < endNum) {
        users[j] = nextUser;
        continue;
      }

      // 如果完成了，不交换; 如果都是比预期多或都比预期少，不交换；
      if (curDirection == nextDirection) {
        continue;
      }

      user.data.forEach((item, curIdx) => {
        // if (isCurIdxChanged) {
        //   console.log('已更换', curIdx);
        //   return;
        // }
        let nextIdx = -1;
        let userLength = nextUser.data.length;
        for (let k = 0; k < userLength && nextIdx === -1; k++) {
          // 如果交换后两者均有降低的趋势，则交换；
          let nUser = nextUser.data[k];

          //如果交换本万，原任务中增加的缺陷条数加上之前与期望值的偏差，原期望值的偏差更小
          let curChange =
            Math.abs(nUser.pf_num - item.pf_num + user.delta_num) <
            Math.abs(user.delta_num);

          // 下个用户交换后偏差更小
          let nextChange =
            Math.abs(item.pf_num - nUser.pf_num + nextUser.delta_num) <
            Math.abs(nextUser.delta_num);

          // console.log(
          //   `用户${i + 1},与用户${j + 1}交换。当前条数：${
          //     item.pf_num
          //   },要更换的条数${nUser.pf_num},当前偏差：${
          //     user.delta_num
          //   },当前任务更换后的偏差:${nUser.pf_num -
          //     item.pf_num +
          //     user.delta_num},下一任务偏差：${
          //     nextUser.delta_num
          //   },下个任务更换后的偏差:${item.pf_num -
          //     nUser.pf_num +
          //     nextUser.delta_num},是否更换:${curChange && nextChange}`
          // );
          if (curChange && nextChange) {
            nextIdx = k;
          }

          // 7T码后不交换(20190301)，确保用户7T数量一致,此处的判断需要确保前后两个任务中都不对7T运算
          if (
            (item.product_name == "9607T" && item.type == 0) ||
            (nUser.product_name == "9607T" && nUser.type == 0)
          ) {
            nextIdx = -1;
          }
        }

        if (nextIdx > -1) {
          changeFlag = true;
          isCurIdxChanged = true;
          // 准备待交换数据
          let nextChangeItem = R.nth(nextIdx)(nextUser.data);
          let curChangeItem = R.clone(item);

          // 更新data中的内容
          user.data[curIdx] = nextChangeItem;
          nextUser.data[nextIdx] = curChangeItem;

          // 用户数据交换
          users[j] = updateStatData(nextUser);
          users[i] = updateStatData(user);
          // 刷新当前统计结果
          // console.log('do change');
        }
      });
    }
  }
  if (!changeFlag) {
    try_times++;
    return users;
  }

  // 循环测试
  return exchangeCarts(users, try_times);
};

let convertResult = (tasks) => {
  let res = [];
  tasks.forEach(({ user_name, user_no, data }) => {
    data = data.map((item) => {
      item.user_name = user_name;
      item.user_no = user_no;
      return item;
    });
    res = [...res, ...data];
  });
  return res;
};

// 核查排活核心流程
module.exports.handleHechaTask = async ({
  tstart,
  tend,
  user_list,
  limit,
  precision,
  prod,
  need_convert,
  totalnum,
}) => {
  endNum = precision;

  // 获取车号列表
  let {
    siyinCarts: carts1,
    codeCarts: carts0,
    data: srcData,
  } = await getTaskList({ tstart, tend, prod });
  if (carts0.length === 0) {
    carts0 = [""];
  }
  if (carts1.length === 0) {
    carts1 = [""];
  }

  // 获取判废条数
  let uploadData = await db.getWipJobs({ carts0, carts1 });

  // 未上传车号列表：
  let unupload_carts = getUnUploadCarts({ srcData, uploadData });

  // 移除已判废车号
  uploadData = R.filter(R.propEq("finished_flag", 0))(uploadData);

  // 超过一定条数不处理
  let unhandle_carts = R.filter((item) => item.pf_num > limit)(uploadData);

  // 过滤20000条以上的产品列表
  uploadData = R.filter((item) => item.pf_num <= limit)(uploadData);
  // console.log(uploadData.length);
  // 得到有效的车号列表

  if (dev) {
    user_list = require("../mock/userList");
  }

  user_list = user_list.map((item) => {
    if (typeof item.work_long_time == "undefined") {
      item.work_long_time = 1;
    }
    return item;
  });

  // 处理当天的判废总量
  let workHour = user_list.reduce((a, b) => a + Number(b.work_long_time), 0);
  let maxNum = totalnum * workHour;

  // console.log("maxNum", maxNum, uploadData.length);
  uploadData = handleLimitTask(R.clone(uploadData), maxNum);
  // console.log(uploadData.length);
  // 计算任务基础信息
  let users = await getTaskBaseInfo({ user_list, uploadData, tstart, tend });

  // 排活
  // let { users: task_list } = distribTasks({
  //   users,
  //   uploadData,
  //   ascend: false
  // });

  /** 20190301:确保7T品排产数一致 */

  let specialCarts = uploadData.filter(
    (item) => item.type == 0 && item.product_name == "9607T"
  );

  let otherCarts = uploadData.filter(
    (item) => !(item.type == 0 && item.product_name == "9607T")
  );

  // console.log(specialCarts, otherCarts);

  // 先排7T
  let res = distribTasks({
    users,
    uploadData: specialCarts,
    ascend: false,
  });

  // 更新7T条数
  res.users = res.users.map(updateStatData);

  // 再排普通产品
  let { users: task_list } = distribTasks({
    users: res.users,
    uploadData: otherCarts,
    ascend: false,
  });
  // return {
  //   task_list,
  //   unupload_carts,
  //   unhandle_carts
  // };

  let tasks = exchangeCarts(task_list);

  if (need_convert) {
    tasks = convertResult(tasks);
  }
  return {
    task_list: tasks,
    unupload_carts,
    unhandle_carts,
  };
};

/**
 * 找出当前车号列表中，指定缺陷总条数的车号列表
 * @param {*} data 当前车号列表
 * @param {*} maxNum 最大缺陷数
 */
const handleLimitTask = (data, maxNum) => {
  let totalNum = data.reduce((a, b) => a + b.pf_num, 0);
  if (totalNum <= maxNum) {
    return data;
  }

  let sum = 0,
    i = 0;
  while (sum < maxNum && i < data.length) {
    sum += data[i].pf_num;
    i++;
  }

  // 一共找出i车产品，第i-1车产品不是最佳选择，先汇总前i-1车产品总缺陷数，将后续产品排序，
  // 找出离相差数据最接近的一项参与排序。

  // 寻找一车最佳产品
  let sumFun = (a) => a.reduce((a, b) => a + b.pf_num, 0);

  let bestIdx = Math.max(i - 1, 0);
  let distArr = data.slice(0, bestIdx);
  let _sum = sumFun(distArr);
  let deltaNum = maxNum - _sum;

  let newArr = data.slice(bestIdx, data.length);
  newArr = newArr.sort((a, b) => a.pf_num - b.pf_num);

  for (let i = 0; i < newArr.length; i++) {
    if (newArr[i].pf_num >= deltaNum) {
      distArr.push(newArr[i]);
      break;
    }
  }
  return distArr;
};
