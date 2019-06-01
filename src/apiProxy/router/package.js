const R = require('ramda');
const { dev } = require('../../util/axios');
const db = require('./db_package');
const { handleOpenNum } = require('../../sync/fakeAfterSinyin');
const lib = require('../../util/lib');
// 每包开包量小于5时，分配完毕
const endNum = 5;

// 参与计算的字段
const calcKey = 'ex_opennum';

const getCartList = R.pluck('carno');

// 手工模式排活，用于数据测试
const init = async (manualMode = false) => {
  if (!manualMode) {
    let needStart = db.getTimeRange();
    if (needStart == 2) {
      console.log('当前时间无需排活');
      return {
        status: false
      };
    }
  }

  let res = await getProdList(manualMode);

  if (!res || res.length === 0) {
    return {
      status: false
    };
  }
  res = flattenTasks(res);

  res.status = await recordTasks(res);
  return res;
};

const recordTasks = async (res) => {
  // 将当日未生产完毕的产品置为取消。
  await db.setPrintCutProdLogCancel();

  let task_id = R.compose(
    R.uniq,
    R.flatten,
    R.map(R.prop('task_id'))
  )(res);

  res = R.clone(res).map((item) => {
    item.expect_num = item.expect_num || '';
    item.task_id = item.task_id || '';
    item.real_num = item.real_num || '';
    return item;
  });

  let {
    data: [dbStatus]
  } = await db.addPrintCutProdLog(res);

  if (dbStatus.affected_rows == 0) {
    console.log('排产数据记录失败');
    return false;
  }
  let {
    data: [{ affected_rows }]
  } = await db.setPrintCutTask();
  // await db.setPrintCutTaskStatus(task_id);
  if (affected_rows < task_id.length) {
    console.log('排产状态更新失败');
    return false;
  }
  console.log('排产状态更新完成');
  return true;
};

const getProdList = async (manualMode = false) => {
  // 1.从后台读取任务设置信息
  let method = manualMode ? 'getPrintCutTaskListManual' : 'getPrintCutTaskList';

  let { data: settings } = await db[method]();

  if (settings.length === 0) {
    console.log('检封裁封自动线排产：当前时间段无排产任务或未到指定时间');
    return false;
  }
  // 2.获取白名单
  let whiteList = await db.getVCbpcWhitelist();

  let data = whiteList.data;
  console.log('1,', data.length);

  // 记录当前白名单信息
  await db.addPrintCutWmsLog({
    remark: JSON.stringify(whiteList),
    rec_time: lib.now()
  });

  // 3.获取开包量，筛选未完工或开包量异常的产品
  let verifiedCarts = await filterValidCarts(data);
  console.log('2,', verifiedCarts.length);

  if (verifiedCarts.length === 0) {
    return [];
  }

  // console.log('2,', verifiedCarts.length, settings);

  // 4.根据任务设置划分出任务列表
  let { mahou: res, allCheck, exchangeCart, directSetCart } = await getTaskList(
    verifiedCarts,
    settings
  );
  console.log('3,', res.length);

  console.log('排活完毕');

  // 5.数据合并
  // 合并码后与全检数据
  res = combineCarts(allCheck, res);

  console.log('4,', res.length);
  // 追加补票信息
  res = combineCarts(exchangeCart, res);
  console.log('5,', res.length);

  console.log('检封裁封自动线排产完成');
  // 指定车号数据处理
  res = conbineDirectCarts(directSetCart, res);
  console.log('6,', res.length);
  return res;
};

// 将排活结果输出为可插入数据库的结构
const flattenTasks = (res) => {
  let data = res.map((item) => {
    let task = R.pick(
      'task_id,type,expect_num,expect_carts,real_num'.split(',')
    )(item);
    return item.data.map((taskItem) => {
      let cartInfo = R.pick(
        'carts_num,gh,prodid,prodname,tech,carno,ex_opennum,idx'.split(',')
      )(taskItem);
      cartInfo.ex_opennum = cartInfo.ex_opennum || '';
      cartInfo.status = 0;
      cartInfo.order_idx = cartInfo.idx;
      Reflect.deleteProperty(cartInfo, 'idx');
      return { ...task, ...cartInfo };
    });
  });
  return R.compose(
    R.map((item) => {
      item.rec_date = lib.now();
      return item;
    }),
    R.flatten
  )(data);
};

const conbineDirectCarts = (src, dist) => {
  let leftArr = R.map((item) => {
    item.type = /\d$/.test(item.type) ? item.type : item.type + item.num;
    return item;
  })(src);

  // 合并数据
  dist = dist.map((machine) => {
    let idx = R.findIndex(
      (item) =>
        item.machine_id == machine.machine_id &&
        item.worktype_name == machine.worktype_name &&
        item.prod_name == machine.prod_name
    )(leftArr);

    if (idx > -1) {
      let { data, type } = leftArr[idx];
      // 数据合并
      machine = Object.assign(machine, {
        type: `${machine.type}+${type}`,
        data: [...data, ...machine.data]
      });
      leftArr = R.remove(idx, 1)(leftArr);
    }
    return machine;
  });

  return [...dist, ...leftArr];
};
// 合并车号信息
const combineCarts = (
  { unlockData: carts, machineSetting: setting },
  mahou
) => {
  mahou = mahou.map((item) => {
    item.type = /\d$/.test(item.type) ? item.type : item.type + item.num;
    return item;
  });
  // 针对该数据做破坏性操作
  let cartByProd = R.groupBy(R.prop('prodname'))(carts);
  let machines = R.compose(
    R.flatten,
    R.map((prodname) => setting[prodname]),
    R.keys
  )(setting);

  // 处理完之后的全检数据
  let allCheck = [];
  machines.forEach((machine) => {
    let { prod_name, num } = machine;
    let dataByProd = cartByProd[prod_name];
    if (R.isNil(dataByProd)) {
      return;
    }
    let data = dataByProd.splice(0, num);
    allCheck.push({ ...machine, data });
  });

  // 合并全检及码后数据
  allCheck.forEach((machine) => {
    let idx = R.findIndex(
      (item) =>
        item.machine_id == machine.machine_id &&
        item.worktype_name == machine.worktype_name
    )(mahou);

    if (idx == -1) {
      // 不存在该机台，直接追加
      mahou.push(machine);
      return;
    }
    let { data, type } = mahou[idx];
    // 数据合并
    mahou[idx] = Object.assign(mahou[idx], {
      type: `${type}+${machine.type}${machine.num}`,
      data: [...data, ...machine.data]
    });
  });
  return mahou;
};

// 指定工艺产品白名单
const getCartsByProc = async (machineSetting, type = '全检品') => {
  // 1.获取白名单
  let { data } = await db.getVCbpcWhitelist(type);

  let allCheck = getUnlockData(data);

  return filterCartsByProc(allCheck, machineSetting, type);
};

const getDirectSetCarts = async (setting) => {
  let machineList = R.filter(R.propEq('type', '指定车号'))(setting);
  let carts = [],
    directSetCart = [];
  machineList.forEach((machine) => {
    let cart = machine.remark.trim().split(',');
    carts = [...carts, ...cart];
  });
  if (carts.length) {
    // let { data } = await db.getVwWimWhitelistWithCarts(carts);

    directSetCart = machineList.map((machine) => {
      machine.data = R.filter((item) => machine.remark.includes(item.carno))(
        carts
      );
      return machine;
    });
  }

  // 直接指定车号的分配结果，不允许排活的车号列表
  return { directSetCart, notAllowedCarts: carts };
};

const getTaskList = async (verifiedCarts, settings) => {
  // 2.获取指定车号产品信息，这些产品只允许直接指定，不允许变更信息
  let { directSetCart, notAllowedCarts } = await getDirectSetCarts(settings);

  // 过滤车号
  verifiedCarts = R.reject((item) => notAllowedCarts.includes(item.carno))(
    verifiedCarts
  );

  // 3.码后车号处理
  let { unlockData: dataWithOpennum, machineSetting } = filterCartsByProc(
    verifiedCarts,
    settings,
    '码后核查'
  );

  console.log('开包量信息获取完毕，排活中');

  // 4.排活
  let mahou = prodistCarts(dataWithOpennum, machineSetting);

  // 5.全检数据
  let allCheck = await getCartsByProc(settings, '全检品');

  // 6.补品
  let exchangeCart = await getCartsByProc(settings, '补品');

  return { mahou, allCheck, exchangeCart, directSetCart };
};

// 处理特定工艺产品
const filterCartsByProc = (carts, setting, type = '码后核查') => {
  setting = R.filter(R.propEq('type', type))(setting);
  setting = handleMachineSetting(setting);
  let prodNum = getProdNum(setting);
  // 截取指定数量的车号
  let unlockData = getValidCarts(carts, prodNum);
  return { unlockData, machineSetting: setting };
};

const getUnlockData = (data) => {
  // 0.数据预处理
  data = data.map(
    ({ gh, prodname, carno, idx, lock_reason, tech, ex_opennum }) => {
      idx = parseInt(idx, 10);
      ex_opennum = parseInt(ex_opennum, 10);
      return {
        gh,
        prodname,
        carno,
        idx,
        lock_reason,
        tech,
        ex_opennum
      };
    }
  );

  // 1.去除已锁车产品
  return R.filter(({ lock_reason }) => R.isNil(lock_reason))(data);
};

// 过滤无效车号，20181113以前
// const filterValidCartsBackup = async (data) => {
//   let unlockData = getUnlockData(data);
//   let cartList = getCartList(unlockData);

//   // 2.过滤未完工产品
//   let completeCarts = dev ? cartList : await getVerifyStatus(cartList);

//   // 读取当前已同步完成的开包量信息
//   let openNums = dev
//     ? completeCarts.map((cart) => {
//         let opennum = getRandomOpenNumByCart();
//         let prodname = cart[2] == 2 ? '9602A' : '9607T';
//         return {
//           cart,
//           prodname,
//           opennum,
//           ex_opennum: opennum,
//           ex_code_opennum: opennum,
//           ex_siyin_opennum: opennum
//         };
//       })
//     : await db.getManualverifydata(completeCarts);

//   // 实际开包量大于一定值时，产品为异常品
//   let abnormalCarts = R.filter((item) => item.ex_opennum > item.limit)(
//     openNums
//   );

//   // 是否需要在此处转异常品
//   console.log('是否需要在此处转异常品', abnormalCarts);
//   let abnormalCartList = R.compose(
//     R.flatten,
//     R.map(R.prop('cart'))
//   )(abnormalCarts);

//   // 3.去除开包量大于指定值的产品
//   // completeCarts = R.reject((item) => abnormalCartList.includes(item))(completeCarts);

//   completeCarts = R.difference(completeCarts, abnormalCartList);

//   // 3.去除判废未完工产品，保证判废完成的产品参与排活
//   let verifiedCarts = R.filter(({ carno }) => completeCarts.includes(carno))(
//     unlockData
//   );

//   return {
//     openNums,
//     verifiedCarts
//   };
// };

// 过滤无效车号,20181113,使用立体库中更新的开包量数据展
const filterValidCarts = async (data) => {
  // 1.未锁车产品(数据接口输出中自动过滤了锁车产品)
  // let unlockData = getUnlockData(data);

  let { data: prodData } = await db.getProductdata();

  let unlockData = data.map((item) => {
    let res = R.find(R.propEq('prod_name', item.prodname))(prodData);
    item.limit = res.limit || 150;
    return item;
  });

  console.log('1.1,', unlockData.length);
  // 2.选择开包量在一定数据量以内的产品
  // unlockData.forEach((item, idx) => {
  //   if (Number(item.ex_opennum) >= item.limit) {
  //     console.log(item.ex_opennum, item.limit, idx, item.carno);
  //   }
  // });

  let cartsFilterByOpennum = R.filter(
    (item) => Number(item.ex_opennum) < Number(item.limit)
  )(unlockData);
  console.log('1.2,', cartsFilterByOpennum.length);

  let cartList = getCartList(cartsFilterByOpennum);

  console.log('1.3,', cartList.length);
  if (cartList.length === 0) {
    return [];
  }

  // 3.过滤未完工产品
  let completeCarts = dev ? cartList : await getVerifyStatus(cartList);

  // 4.去除判废未完工产品，保证判废完成的产品参与排活
  return R.filter(({ carno }) => completeCarts.includes(carno))(
    cartsFilterByOpennum
  );
};

const handleMachineSetting = R.compose(
  R.groupBy(R.prop('prod_name')),
  R.map((item) => {
    item.num = parseInt(item.num, 10);
    return item;
  })
);

const getProdNum = (machineSetting) =>
  R.compose(
    R.map((prodname) => {
      let nums = R.compose(
        R.flatten,
        R.map(R.prop('num'))
      )(machineSetting[prodname]);
      let num = R.reduce(R.add, 0)(nums);
      return {
        prodname,
        num
      };
    }),
    R.keys
  )(machineSetting);

// 获取每个品种指定的大万数
const getValidCarts = (carts, setting) => {
  carts = R.groupBy(R.prop('prodname'))(carts);
  let res = [];
  setting.forEach(({ prodname, num }) => {
    let curData = carts[prodname];
    if (!R.isNil(curData)) {
      curData = R.slice(0, num)(curData);
      res = [...res, ...curData];
    }
  });
  return res;
};

// 车号列表判废状态
// 获取车号判废状态结果，确保所有产品已执行完图像判废；
const getVerifyStatus = db.getQfmWipJobs;

// 生成随机数据
const getRandomOpenNumByCart = (cart) => {
  return parseInt(Math.random() * 100 + 50);
};

// 单万产品开包量
const getOpenNumByCart = async (cart, openNums) => {
  // 已同步的车号列表中获取数据
  let res = R.find(R.propEq('cart', cart))(openNums);
  if (res) {
    return res;
  }
  res = await handleOpenNum(cart);
  res.opennum = res.ex_opennum - res.ex_code_opennum - res.ex_siyin_opennum;
  return { status: false, ...res };
};

// 批量获取开包量
const getOpenNum = async (carts, openNums) => {
  let result = [];
  for (let i = 0; i < carts.length; i++) {
    let item = carts[i];
    let res = await getOpenNumByCart(item.carno, openNums);
    result.push({ ...item, ...res });
  }
  return result;
};

// 任务分配
const prodistCarts = (carts, setting) => {
  let res = R.compose(
    R.flatten,
    R.map((prodname) => {
      let cartList = R.filter(R.propEq('prodname', prodname))(carts);
      return prodistCartByProd(cartList, setting[prodname]);
    }),
    R.keys
  )(setting);

  /**
   * 2018-11-08: 由于设备之间不能跨品种生产，此处交换数据不能跨不同品种：
   * 流程：对原始数据按品种分组，取键值，对单独品种操作,完毕后重新打平数组
   */
  // 交换车号(不能跨品种交换)
  let opennumByProd = R.groupBy(R.prop('prod_name'))(res);
  res = R.compose(
    R.flatten,
    R.map((prodname) => exchangeCarts(opennumByProd[prodname])),
    R.keys
  )(opennumByProd);

  // 按出库顺序排序
  return R.map((item) => {
    item.data = R.sort(R.ascend(R.prop('idx')))(item.data);
    return item;
  })(res);
};

/**
 * 根据品种分配任务
 * carts:车号列表，仅包含单一品种
 * setting:对应该品种需要分配到几个班次
 */
const prodistCartByProd = (carts, setting) => {
  // 计算基础信息:期望包数
  setting = getTaskBaseInfo({ carts, setting });
  // 分配任务
  res = distribCarts({ setting, carts, ascend: false });
  return res.setting;
};

// 汇总列数据
const calcTotalData = (key, data) =>
  R.compose(
    R.reduce(R.add, 0),
    R.map(R.prop(key))
  )(data);

// 汇总任务数汇总
const getTaskBaseInfo = ({ setting, carts }) => {
  // 汇总开包量总数
  let totalOpennum = calcTotalData(calcKey, carts);
  // 汇总车号
  let totalCartsNum = calcTotalData('num', setting);
  if (totalCartsNum == 0) {
    return [];
  }
  // 每单位开包量
  let openNumPerUnit = totalOpennum / totalCartsNum;
  return R.clone(setting).map((item) => {
    item = Object.assign(item, {
      expect_num: parseInt(item.num * openNumPerUnit),
      expect_carts: item.num,
      real_num: 0,
      carts_num: 0,
      delta_num: 0,
      data: [],
      success: false
    });
    return item;
  });
};

// 首次分配任务
const distribCarts = ({ setting, carts, ascend }) => {
  if (carts.length == 0) {
    return { setting, carts };
  }
  // 对carts排序
  if (ascend) {
    carts = R.sort(R.ascend(R.prop(calcKey)))(carts);
  } else {
    carts = R.sort(R.descend(R.prop(calcKey)))(carts);
  }

  // 用户信息更新
  setting = R.map((curMachine) => {
    // 如果该万已经被分配，继续
    if (curMachine.success || carts.length == 0) {
      return curMachine;
    }
    // 取第一项数据
    let head = R.head(carts);

    // 待排活数据删除一项
    carts = R.tail(carts);
    let { real_num, expect_num, carts_num, num: expect_carts } = curMachine;
    // 更新当前状态
    real_num = Number(real_num) + Number(head[calcKey]);
    carts_num = carts_num + 1;
    let delta_num = real_num - expect_num;
    let data = [...curMachine.data, head];
    let finished = Math.abs(delta_num) <= endNum;

    // 超过指定万数时，当前任务停止排活
    let success = carts_num === expect_carts;
    return Object.assign(curMachine, {
      real_num,
      carts_num,
      delta_num,
      data,
      success,
      finished
    });
  })(setting);

  return distribCarts({
    setting,
    carts,
    ascend: !ascend
  });
};

const updateStatData = (user) => {
  // 汇总缺陷总数
  user.real_num = calcTotalData(calcKey, user.data);
  user.delta_num = user.real_num - user.expect_num;
  return user;
};

// 交换车号
const exchangeCarts = (task_list, try_times = 0) => {
  // console.log(`第${try_times}次循环:`);
  if (try_times >= 5) {
    return task_list;
  }

  let changeFlag = false;
  // 根据与期望值的差值做排序
  let carts = R.sort(R.ascend(R.prop('delta_num')))(task_list);
  let len = carts.length;
  for (let i = 0; i < len; i++) {
    let user = R.clone(carts[i]);
    let isCurIdxChanged = false;

    // 更新finished状态
    if (Math.abs(user.delta_num) < endNum) {
      carts[i] = user;
      continue;
    }

    let curDirection = user.delta_num > 0;

    // 与前序数据逆向对比，当前组如果差值为负表示缺少判废数量，同正值（多出判废数量）的车号更换
    for (let j = len - 1; j > 0; j--) {
      if (i == j) {
        continue;
      }
      let nextUser = R.clone(carts[j]);
      let nextDirection = nextUser.delta_num && nextUser.delta_num > 0;

      if (Math.abs(nextUser.delta_num) < endNum) {
        carts[j] = nextUser;
        continue;
      }

      // 如果完成了，不交换; 如果都是比预期多或都比预期少，不交换；
      if (curDirection == nextDirection) {
        continue;
      }

      user.data.forEach((item, curIdx) => {
        let nextIdx = -1;
        let userLength = nextUser.data.length;
        for (let k = 0; k < userLength && nextIdx === -1; k++) {
          // 如果交换后两者均有降低的趋势，则交换；
          let nUser = nextUser.data[k];
          //如果交换本万，原任务中增加的缺陷条数加上之前与期望值的偏差，原期望值的偏差更小
          let curChange =
            Math.abs(nUser[calcKey] - item[calcKey] + user.delta_num) <
            Math.abs(user.delta_num);

          // 下个用户交换后偏差更小
          let nextChange =
            Math.abs(item[calcKey] - nUser[calcKey] + nextUser.delta_num) <
            Math.abs(nextUser.delta_num);

          if (curChange && nextChange) {
            nextIdx = k;
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
          carts[j] = updateStatData(nextUser);
          carts[i] = updateStatData(user);
          // 刷新当前统计结果
          // console.log('do change');
        }
      });
    }
  }
  if (!changeFlag) {
    try_times++;
    return carts;
  }

  // 循环测试
  return exchangeCarts(carts, try_times);
};

module.exports.dev = dev;
module.exports.init = init;
