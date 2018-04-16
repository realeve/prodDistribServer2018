// 四新
let newProc = require("./task/newProc");

// 异常品
let abnormalProd = require("./task/abnormalProd");

// 人工验证(该部分处理逻辑移至前台，此处不再做测试)
let manualCheck = require("./task/manualCheck");

// 立体库测试
let wms = require("./wmsTest");

// 机台通知连续废
let multiWeak = require("./task/multiWeak");

const init = async () => {
  await abnormalProd.init();
  // await newProc.init().catch(e => console.log(e));
  // await wms.init().catch(e => console.log(e));
  // await manualCheck.init();
  // await multiWeak.init();
};

module.exports = { init };
