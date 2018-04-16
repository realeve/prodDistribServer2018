let R = require("ramda");
let wms = require("./util/wms");
let lib = require("./util/lib");
const consola = require("consola");

// 接口1：在库状态，测试通过
let stockStatus = async () => {
  let data = await wms.getStockStatus(["1840K000", "1820K048"]);
  // [{"pscode":"bz","orgid":"1449","carno":"1840K000","quantity":"350000"}]
  consola.success(JSON.stringify(data));
};

// 接口2：批量车号设定质检工艺
let setProc = async () => {
  let data = await wms.setProcs({
    carnos: ["1840K000", "1820K048"],
    checkType: "全检品"
  });
  consola.success(JSON.stringify(data));
};

// 接口3：锁车原因列表
let getLockReason = async () => {
  let data = await wms.getBlackReason();
  consola.success(JSON.stringify(data));
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

  let data = await wms.addBlackReason({
    reason_code: "q_abnormalProd",
    reason_desc: "异常品锁车"
  });

  consola.success(JSON.stringify(data));
};

// 接口5：批量锁车
batchLockCarts = async () => {
  let data = await wms.setBlackList({
    reason_code: "q_handCheck",
    carnos: ["1740B387", "1740B388", "1740B403"]
  });
  consola.success(JSON.stringify(data));
};

// 接口6：批量解锁
unlockCarts = async () => {
  let data = await wms.setWhiteList(["1740B387", "1740B388", "1740B403"]);
  consola.success(JSON.stringify(data));
};

const init = async () => {
  // stockStatus();
  // setProc();
  // addLockReason();
  // getLockReason();
  // batchLockCarts();
  // unlockCarts();
};

module.exports = { init };
