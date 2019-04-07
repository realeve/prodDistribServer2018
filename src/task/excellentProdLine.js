let R = require('ramda');
let db = require('../util/db_excellentProdLine');
let lib = require('../util/lib');

const getExcellentStatusByProc = (proc) => {
  let status = 0;
  switch (proc) {
    case '胶印':
      status = 1;
      break;
    case '丝印':
      status = 2;
      break;
    case '凹一印':
      status = 3;
      break;
    case '凹二印':
      status = 4;
      break;
  }
  return status;
};

// 增加下机逻辑处理，只处理将胶印产品置为精品
module.exports.init = async () => {
  let prod = '9607T';

  // 获取精品生产机台
  let { data: excellentProdLine } = await db.getUdtPsExchange(prod);
  let captainList = R.map(R.prop('captain_name'))(excellentProdLine);

  let { data: cartList } = await getVCbpcCartlistYesterday();

  // 记录胶印原始状态(将车号置为唯一索引)
  await db.addPrintMesExcellentProdline({
    cart_number: cart,
    offset_back: 1,
    offset_front: 1
    // 此处需修改接口，全部置为1,
    // 添加是否完成判断的状态字段
  });
};

// 同步，凌晨处理前一个工作日大张废超标，修停换异常，丝印实废过多三种场景。
module.exports.sync = async () => {
  // 是否需要记录
  let curHour = parseInt(moment().format('HHMM'), 10);
  // 凌晨2点处理该任务
  console.log(curHour);
  if (curHour > 1059 || curHour < 200) {
    console.log('无需处理精品线记录');
    return;
  }

  // 昨日生产车号列表,确认是否有工序名称(当前精品标志，是否超时生产，需要设置的目标字段)
  let { data: cartList } = await db.getVCbpcCartlistYesterday();

  // 转换获取为车号数组
  let carts = R.map(R.prop('cart_number'))(cartList);

  // 1.精品线_单工序换票数是否大于3张
  let { data: handledList } = await db.getQmRectifyMaster(carts);
  let cartsChanged = R.map(R.prop('cart_number'))(cartList);

  // 回写cartList,将其中换票异常的置为全检
  cartList = cartList.map((item) => {
    if (cartsChanged.includes(item.cart_number)) {
      item.all_check = 1;
    }
    return item;
  });

  // 2.精品线_丝印机台作废超阈值(当日生产完毕的丝印产品，判废未完成前该逻辑无意义)
  let yesterday = moment()
    .subtract(1, 'days')
    .format('YYYYMMDD');
  let { data: res3 } = await db.getQaRectifyMasterByDate(yesterday);

  // 获取   cart_number,proc_name置为丝印，状态标志位回写为胶印(n-1，当前为2置为1，当前为1置为0)。max(0,n-1)
  res3 = res3.map((item) => {
    item.proc_name = '丝印';
    return item;
  });

  // 合并1、2、3的车号列表，统一置为非精品,此处调用接口
  console.log(cartList);
  console.log(res3);

  // 将对应车号置为全检，原因为非精品异常信息
  let allCheckList = R.compose(
    R.map(R.prop('cart_number')),
    R.filter(R.propEq('all_check', 1))
  )(cartList);
  console.log([...cartsChanged, ...allCheckList]);

  // 精品线车号列表
  let ExcellentList = R.compose(
    R.map(R.prop('cart_number')),
    R.reject(R.propEq('all_check', 1))
  )(cartList);
  console.log(ExcellentList);

  // 筛选凹二印
  let intagCarts = R.compose(
    R.map(R.prop('cart_number')),
    R.filter(R.propEq('proc_name', '凹二印'))
  )(ExcellentList);

  // 剔除其中全检品，剩余为未设置工艺
  let excellentProdLineCarts = [];
  if (excellentProdLineCarts.length) {
    // 精品置为码后核查工艺;
  }

  // 分离工序信息，将变更记录至log
  // let splitProcList = (procname) =>
  //   R.compose(
  //     R.map(R.prop('cart_number')),
  //     R.filter((item) => item.proc_name.includes(procname))
  //   )(handledList);
  // let intagBackList = splitProcList('凹一');
  // let intagFrontList = splitProcList('凹二');
  // let silkList = splitProcList('丝');

  // if (intagBackList.length > 0) {
  //   let params = intagBackList.map((cart_number) => ({
  //     intaglio_back: 0,
  //     cart_number
  //   }));
  //   await db.setPrintMesExcellentProdlineIntagBack(params);
  // }

  // if (intagFrontList.length > 0) {
  //   let params = intagFrontList.map((cart_number) => ({
  //     intaglio_front: 0,
  //     cart_number
  //   }));
  //   await db.setPrintMesExcellentProdlineIntagFront(params);
  // }

  // if (silkList.length > 0) {
  //   let params = silkList.map((cart_number) => ({
  //     silk: 0,
  //     cart_number
  //   }));
  //   await db.setPrintMesExcellentProdlineSilk(params);
  // }
};
