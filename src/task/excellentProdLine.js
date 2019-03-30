let R = require('ramda');
let db = require('../util/db_excellentProdLine');
let lib = require('../util/lib');

// 增加下机逻辑处理，只处理将胶印产品置为精品
module.exports.init = async ({ process, cart, machine_name }) => {
  console.log(process, cart);
  // 打印工序，车号信息

  // 只对7T胶印处理
  if (cart[2] != '8' || !['胶印', '胶一印', '胶二印'].includes(process)) {
    return false;
  }

  let { data: excellentProdLine } = await db.getUdtPsExchange();
  let captainList = R.map(R.prop('captain_name'))(excellentProdLine);

  // 根据 excellentProdLine 判断 是否是精品线
  let notExcellentProdLine = true;
  captainList.forEach((item) => {
    // 当前机台是精品线机长
    if (machine_name.includes(item)) {
      notExcellentProdLine = false;
    }
  });
  if (notExcellentProdLine) {
    return;
  }
  // 从数据库获取数据，判断是否已有数据

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
  // 生产车号列表,确认是否有工序名称,确认只处理精品线产品
  let { data: cartList } = await db.getVCbpcCartlistLog();

  // 转换获取为车号数组
  let carts = R.map(R.prop('cart_number'))(cartList);

  // 1.精品线_单工序换票数是否大于3张
  let { data: handledList } = await db.getQmRectifyMaster(carts);

  // 2.精品线_印刷时长是否超时(修停换) }
  let { data: res2 } = await db.getVCbpcCartlist(cartList);

  // 3.精品线_丝印机台作废超阈值(当日生产完毕的丝印产品，判废未完成，该逻辑无意义)
  // let { data: res3 } = await db.getQaRectifyMaster(cart);

  let yesterday = moment()
    .subtract(1, 'days')
    .format('YYYYMMDD');
  let { data: res3 } = await db.getQaRectifyMasterByDate(yesterday);

  // 获取   cart_number,proc_name置为丝印
  res3 = res3.map((item) => {
    item.proc_name = '丝印';
    return item;
  });

  // 合并数据 res1,res2,res3 对应车号及工序
  handledList = [...handledList, ...res2, ...res3];
  let notExcellentProdLineCarts = R.map(R.prop('cart_number'))(handledList);
  // 合并1、2、3的车号列表，统一置为非精品,此处调用接口

  // 将对应车号置为全检，原因为非精品异常信息

  // 精品线车号列表
  // 筛选凹二印
  let intagCarts = R.compose(
    R.map(R.prop('cart_number')),
    R.filter(R.propEq('proc_name', '凹二印'))
  )(cartList);
  let excellentProdLineCarts = R.difference(
    intagCarts,
    notExcellentProdLineCarts
  );
  if (excellentProdLineCarts.length) {
    // 精品置为码后核查工艺;
  }

  // 分离工序信息，将变更记录至log
  let splitProcList = (procname) =>
    R.compose(
      R.map(R.prop('cart_number')),
      R.filter((item) => item.proc_name.includes(procname))
    )(handledList);
  let intagBackList = splitProcList('凹一');
  let intagFrontList = splitProcList('凹二');
  let silkList = splitProcList('丝');

  if (intagBackList.length > 0) {
    let params = intagBackList.map((cart_number) => ({
      intaglio_back: 0,
      cart_number
    }));
    await db.setPrintMesExcellentProdlineIntagBack(params);
  }

  if (intagFrontList.length > 0) {
    let params = intagFrontList.map((cart_number) => ({
      intaglio_front: 0,
      cart_number
    }));
    await db.setPrintMesExcellentProdlineIntagFront(params);
  }

  if (silkList.length > 0) {
    let params = silkList.map((cart_number) => ({
      silk: 0,
      cart_number
    }));
    await db.setPrintMesExcellentProdlineSilk(params);
  }
};
