const db = require("./db_image_judge");
const R = require("ramda");
const { dev } = require("../../util/axios");
const moment = require("moment");

/** 图像核查排产 */

module.exports.dev = dev;

// 图核判废接口

// 100条以内不重排
let endNum = 50;
const totalTryTimes = 50;

// 数组随机排序，如果某次排产结果不佳，通过随机乱序可生成更佳结果
const randomArr = (arr) => arr.sort(() => Math.random() - 0.5);

// 获取当月已判废量
const getHistoryWorks = false;

// 需要锁定大万数的品种

const needLock = (item) =>
  ("9607T" == item.product_name && item.type == 0) ||
  ("9602T" == item.product_name && item.type == 2);

// 过滤未上传车号
const getUnUploadCarts = ({ srcData, uploadData }) => {
  let uploadCarts = R.pluck("cart_number")(uploadData);

  let unUploadCarts = R.reject((cart_number) =>
    uploadCarts.includes(cart_number)
  )(srcData);

  return unUploadCarts;
};

// 汇总列数据
const calcTotalData = (key, data) =>
  R.compose(R.reduce(R.add, 0), R.map(R.prop(key)))(data);

// 汇总任务数汇总
const getTaskBaseInfo = async ({
  user_list,
  uploadData,
  validUploadData,
  totalnum,
  tstart,
  tend,
}) => {
  let validTotal = calcTotalData("pf_num", validUploadData);
  let needUsers = Math.ceil(validTotal / totalnum);

  // 汇总缺陷总数
  let totalFakes = calcTotalData("pf_num", uploadData);

  tstart = moment(tstart).startOf("month").format("YYYYMMDD");
  tend = moment(tend).endOf("month").format("YYYYMMDD");

  // 月度判废量
  let pfNumByMonth = !getHistoryWorks
    ? []
    : await db
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
    let userPfNum = !getHistoryWorks
      ? []
      : R.filter(R.propEq("operator_name", item.user_name))(pfNumByMonth);
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
      // 总任务条数
      validTotal,
      // 最少需要多少人
      needUsers,
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
  user.prod7 = user.data.filter((item) => needLock(item)).length;
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
          if (needLock(item) || needLock(nUser)) {
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

// {
//   tstart: '20210320',
//   tend: '20210320',
//   user_list: [
//     { user_name: '邓丽', user_no: '54001804', work_long_time: '1' },
//     { user_name: '彭瑶', user_no: '54002625', work_long_time: 0.9375 },
//     { user_name: '蒙娅', user_no: '54001692', work_long_time: '1' },
//     { user_name: '蒋静', user_no: '54001703', work_long_time: 1 },
//     { user_name: '夏志英', user_no: '54001656', work_long_time: 1 },
//     { user_name: '何媛方', user_no: '54002159', work_long_time: 1 },
//     { user_name: '赵川', user_no: '54002710', work_long_time: 1 }
//   ],
//   limit: 20000,
//   precision: 100,
//   carts: {
//     siyin: [
//       '2075H906', '2075J063', '2075J066',
//       '2075J068', '2075J070', '2075J109',
//       '2075J110', '2075J113', '2075J114',
//       '2075J115', '2075J125', '2075J191',
//       '2075H898', '2075H900', '2075J064',
//       '2075J069', '2075J071', '2075J073',
//       '2075J079', '2075J087', '2075J102',
//       '2075J106', '2075J108', '2075J127',
//       '2075J145', '2075H929', '2075J065',
//       '2075J078', '2075J080', '2075J082',
//       '2075J105', '2075J107', '2075J111',
//       '2075J116', '2075J118', '2075J121',
//       '2075J138'
//     ],
//     mahou: [
//       '2025C104', '2025C362', '2025C380',
//       '2025C382', '2025C389', '2025C396',
//       '2025C404', '2025C405', '2025C409',
//       '2025C423', '2025C431', '2025C432',
//       '2025C433', '2075G807', '2075G815',
//       '2075G824', '2075G832', '2075G958',
//       '2075H000', '2075H047', '2075H053',
//       '2075H067', '2075H079', '2075H090',
//       '2075H338', '2075G800', '2075G806',
//       '2075G808', '2075G810', '2075G819',
//       '2075G822', '2075G825', '2075H016',
//       '2075H045', '2075H080', '2075H101',
//       '2075H119'
//     ],
//     tubu: [
//       '2025C283', '2025C284', '2025C286',
//       '2025C288', '2025C290', '2025C300',
//       '2025C301', '2025C304', '2025C306',
//       '2025C309', '2025C316', '2025C344',
//       '2045C524', '2045C525', '2045C531',
//       '2045C540', '2045C542', '2045C550',
//       '2045C554', '2045C559', '2045C560',
//       '2045C563', '2045C565', '2045C566'
//     ]
//   },
//   need_convert: false,
//   totalnum: 20000
// }

// 核查排活核心流程
module.exports.handleHechaTask = async ({
  tstart,
  tend,
  user_list,
  /* 低于该值时判废 */
  limit,
  /* 停止精度 */
  precision,
  carts,
  need_convert,
  /* 每人最多判多少 */
  totalnum,
}) => {
  endNum = precision;

  // 获取判废条数，调整该接口，支持对丝印，码后，涂布的条数获取条数数据；
  let uploadData = await db.getWipJobs({
    carts0: carts.mahou.length == 0 ? [""] : carts.mahou,
    carts1: carts.siyin.length == 0 ? [""] : carts.siyin,
    carts2: carts.tubu.length == 0 ? [""] : carts.tubu,
  });

  // 未上传车号列表：// 根据已上传车号和已生产车号来计算未上传车号
  let unupload_carts = getUnUploadCarts({
    srcData: [...carts.siyin, ...carts.mahou, ...carts.tubu],
    uploadData,
  });

  if (unupload_carts.length > 0) {
    // 获取未上传车号的生产记录
    unupload_carts = await db.getVCbpcCartlist({
      tstart,
      tend,
      carts: unupload_carts,
    });
  }

  let uncomplete = R.filter((item) => item.item_flag > 1)(uploadData);

  // 移除已判废车号,移除已领取车号
  uploadData = R.filter((item) => item.item_flag <= 1)(uploadData);

  // 超过一定条数不处理
  let unhandle_carts = R.filter((item) => item.pf_num > limit)(uploadData);

  // 过滤20000条以上的产品列表
  uploadData = R.filter((item) => item.pf_num <= limit)(uploadData);
  // console.log(uploadData.length);
  // 得到有效的车号列表

  if (dev) {
    user_list = require("../mock/userList");
  }

  // 对人员随机排序，防止条数多的产品给到指定用户列表
  user_list = randomArr(user_list);

  // 对已上传的数据随机排序，让丝印涂布随机排列
  uploadData = randomArr(uploadData);

  user_list = user_list.map((item) => {
    if (typeof item.work_long_time == "undefined") {
      item.work_long_time = 1;
    }
    return item;
  });

  // 处理当天的判废总量
  let workHour = user_list.reduce((a, b) => a + Number(b.work_long_time), 0);
  let maxNum = totalnum * workHour;

  let validUploadData = R.clone(uploadData);

  // console.log("maxNum", maxNum, uploadData.length);

  // 本次任务指定的人员按不超过2W条排产
  uploadData = handleLimitTask(R.clone(uploadData), maxNum);
  // console.log(uploadData.length);
  // 计算任务基础信息
  let users = await getTaskBaseInfo({
    user_list,
    uploadData,
    validUploadData,
    totalnum,
    tstart,
    tend,
  });

  // 排活
  // let { users: task_list } = distribTasks({
  //   users,
  //   uploadData,
  //   ascend: false
  // });

  /** 20190301:确保7T品排产数一致 */
  // 其它品种任意排列
  let otherCarts = uploadData.filter((item) => !needLock(item));

  // console.log(specialCarts, otherCarts);

  // 先排2T
  let res = distribTasks({
    users,
    uploadData: uploadData.filter(
      (item) => item.product_name === "9602T" && item.type == 2
    ),
    ascend: false,
  });

  // 更新2T条数
  res.users = res.users.map(updateStatData);

  // 再排7T(此时需将用户顺序乱序，防止7T多的用户2T品重新变多)
  let res2 = distribTasks({
    users: res.users.reverse(),
    uploadData: uploadData.filter(
      (item) => item.product_name === "9607T" && item.type == 0
    ),
    ascend: false,
  });

  // 更新7T条数
  res2.users = res2.users.map(updateStatData);

  // 再排普通产品
  let { users: task_list } = distribTasks({
    users: res2.users,
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

  tasks = tasks.map((item) => {
    item.data = item.data.sort((a, b) => Number(a.type) - Number(b.type));
    return item;
  });

  return {
    task_list: tasks,
    unupload_carts,
    unhandle_carts,
    uncomplete,
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

// 号码判废排活核心流程
module.exports.handleCodeTask = async ({
  tstart,
  tend,
  user_list,
  carts,
  need_convert,
}) => {
  let totalnum = 50000;

  // 获取判废条数，调整该接口，支持对丝印，码后，涂布的条数获取条数数据；
  let uploadData = await db.getCodeWipProdLogs(carts.code);

  // console.log(uploadData);
  // console.log(carts.code);
  // 未上传车号列表：// 根据已上传车号和已生产车号来计算未上传车号
  let unupload_carts = getUnUploadCarts({
    srcData: carts.code,
    uploadData,
  });

  if (unupload_carts.length > 0) {
    // 获取未上传车号的生产记录
    unupload_carts = await db.getVCbpcCartlist({
      tstart,
      tend,
      carts: unupload_carts,
    });
  }

  // 14表示复核
  let uncomplete = R.filter((item) => item.item_flag == 14)(uploadData);

  // 获取车号列表
  let uncompleteCarts = R.pluck("cart_number")(uncomplete);

  // 移除已判废车号,移除已领取车号
  uploadData = R.reject((item) => uncompleteCarts.includes(item.cart_number))(
    uploadData
  );

  if (dev) {
    user_list = require("../mock/userList");
  }

  // 对人员随机排序，防止条数多的产品给到指定用户列表
  user_list = randomArr(user_list);

  // 对已上传的数据随机排序，让丝印涂布随机排列
  uploadData = randomArr(uploadData);

  user_list = user_list.map((item) => {
    if (typeof item.work_long_time == "undefined") {
      item.work_long_time = 1;
    }
    return item;
  });

  // 处理当天的判废总量
  let workHour = user_list.reduce((a, b) => a + Number(b.work_long_time), 0);
  let maxNum = totalnum * workHour;

  let validUploadData = R.clone(uploadData);

  uploadData = handleLimitTask(R.clone(uploadData), maxNum);
  // console.log(uploadData.length);
  // 计算任务基础信息
  let users = await getTaskBaseInfo({
    user_list,
    uploadData,
    validUploadData,
    totalnum,
    tstart,
    tend,
  });

  // 排产品
  let { users: task_list } = distribTasks({
    users,
    uploadData,
    ascend: false,
  });

  let tasks = exchangeCarts(task_list);

  if (need_convert) {
    tasks = convertResult(tasks);
  }

  tasks = tasks.map((item) => {
    item.data = item.data.sort((a, b) => Number(a.type) - Number(b.type));
    return item;
  });

  return {
    task_list: tasks,
    unupload_carts,
    uncomplete,
    unhandle_carts: [],
  };
};
