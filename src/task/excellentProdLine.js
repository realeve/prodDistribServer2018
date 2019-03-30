let R = require('ramda');
let db = require('../util/db_excellentProdLine');
let lib = require('../util/lib');

// 增加下机逻辑处理，只处理将胶印产品置为精品
const init = async (params) => {
  console.log(params);
  // 打印工序，车号信息

  let excellentProdLine = await db.getUdtPsExchange();

  // 根据 excellentProdLine 判断 是否是精品线
  let notExcellentProdLine = true;
  if (notExcellentProdLine) {
    return;
  }

  // 胶印，初始化
  let isOffset = true;
  let cart_number = params.cart_number;

  if (isOffset) {
    // 记录胶印原始状态
    let res = await db.addPrintMesExcellentProdline({
      cart_number,
      offset_back: 1,
      offset_front: 1
    });
  }
};

// 同步，凌晨处理前一个工作日大张废超标，修停换异常，丝印实废过多三种场景。
const sync = async () => {
  // 生产车号列表
  let { data: cartList } = await db.getVCbpcCartlist();
  // 转换获取为车号数组
  let carts = R.compose(
    R.flatten,
    R.map(R.prop('cart_number'))
  )(cartList);

  // 1.精品线_单工序换票数是否大于3张
  let res = await db.getQmRectifyMaster(carts);

  // 2.精品线_印刷时长是否超时(修停换) }
  let res2 = await db.getVCbpcCartlist(cartList);

  // 合并数据 res,res2，获取   cart_number,proc_name

  // 3.精品线_丝印机台作废超阈值
  let res3 = await db.getQaRectifyMaster(cart);

  let res4 = await db.getQaRectifyMasterByDate(lib.ymd());

  // 合并数据 res3,res4，获取   cart_number,proc_name置为丝印

  // 合并数据 res1,res2,res3,res4 对应车号及工序

  // 分离工序信息，将变更记录至log

  // 合并1、2、3、4的车号列表，统一置为非精品
  // 调用接口
};
