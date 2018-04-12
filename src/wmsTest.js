let R = require("ramda");
let wms = require("./util/wms");
let lib = require("./util/lib");
const consola = require("consola");

// 在库状态，测试通过
let stockStatus = async () => {
  let data = await wms.getStockStatus(["1840K000", "1820K048"]);
  // [{"pscode":"bz","orgid":"1449","carno":"1840K000","quantity":"350000"}]
  consola.success(JSON.stringify(data));
};

// 设置工艺流程
let setProc = async () => {
  data = await wms.setProcs({
    carnos: ["1840K000", "1820K048"],
    checkType: "全检品"
  });
  consola.success(JSON.stringify(data));
};

const init = async () => {
  // stockStatus();
  setProc();
};

module.exports = { init };
