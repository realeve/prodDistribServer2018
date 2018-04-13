// 四新
let newProc = require("./task/newProc");

// 异常品
let abnormalProd = require("./task/abnormalProd");

// 人工验证
let manualCheck = require("./task/manualCheck");

// 立体库测试
let wms = require("./wmsTest");

// 机台通知连续废
let multiWeak = require("./task/multiWeak");

const init = async () => {
  // await handleNewProc.init().catch(e => console.log(e));
  // await wms.init();
  // await handleAbnormal.init();
  // await manualCheck.init();
  await multiWeak.init();
};

module.exports = { init };
