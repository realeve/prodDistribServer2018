let R = require("ramda");
let wms = require("./util/wms");
let lib = require("./util/lib");
// const consola = require("consola");

const cartList = ["1780F949", "1780F806", "1780F865", "1780F919", "1780F724", "1780F999", "1780F000", "1780F600", '1780F6000'];

// 接口1：在库状态，测试通过
let stockStatus = async () => {
  let { result } = await wms.getStockStatus(cartList);
  // [{"pscode":"bz","orgid":"1449","carno":"1840K000","quantity":"350000"}]
  let res = R.map(R.prop('carno'))(result);
  console.log(JSON.stringify(res));
  console.log(R.without(res, cartList))
};

// 接口2：批量车号设定质检工艺
let setProc = async () => {
  let cartList = ['1840K010'];
  let { result } = await wms.setProcs({
    carnos: cartList,
    checkType: "全检品"
  });
  console.log(JSON.stringify(result));
  console.log(R.without(result.handledList, cartList))
};

// 接口3：锁车原因列表
let getLockReason = async () => {
  let data = await wms.getBlackReason();
  console.log(JSON.stringify(data));
};

// 接口4：添加锁车原因
let addLockReason = async () => {
  // let data = await wms.addBlackReason({
  //   reason_code: "q_handCheck",
  //   reason_desc: "人工全检锁车"
  // });

  // let data = await wms.addBlackReason({
  //   reason_code: "q_newProc",
  //   reason_desc: "四新批量锁车"
  // });

  // let data = await wms.addBlackReason({
  //   reason_code: "q_abnormalProd",
  //   reason_desc: "异常品锁车"
  // });

  let data = await wms.addBlackReason({
    reason_code: "q_batchLock",
    reason_desc: "人工批量锁车,不拉号"
  });

  console.log(JSON.stringify(data));
};

// 接口5：批量锁车
let batchLockCarts = async () => {
  let carnos = ["1840K028", "1840K029", "1880K039", "1820K012", '1820K013', '1860K999'];
  let { result } = await wms.setBlackList({
    reason_code: "q_handCheck",
    carnos
  });
  console.log(JSON.stringify(result));
  console.log(R.without(result.handledList, carnos))
};

// 接口6：批量解锁
let unlockCarts = async () => {
  let carnos = ["1840K028", "1840K029", "1880K039", "1820K012", '1820K013', '1860K999'];
  let { result } = await wms.setWhiteList(carnos);
  console.log(JSON.stringify(result));
  console.log(R.without(result.handledList, carnos))
};

// 接口7：码后核查工艺验证测试
let setProcCheck = async () => {
  // let carnos = ['1880B579', '1880B560', '1880B541', '1880B558', '1880B538', '1880B582', '1880A911', '1880A970', '1880B592', '1880B006', '1880B526', '1880B390', '1880B575'];

  let carnos = ['1880B250', '1880B253'];
  // 取消任务
  let { result } = await wms.setReviewList({
    carnos,
    review: 0
  });
  console.log(JSON.stringify(result));
};


const init = async () => {
  // stockStatus();
  // setProc();
  // addLockReason();
  // getLockReason();

  // batchLockCarts();
  // unlockCarts();
  setProcCheck();
};

module.exports = { init };