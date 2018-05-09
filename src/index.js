let consola = require('consola');
const lib = require('./util/lib');

// 四新
let newProc = require("./task/newProc");

// 异常品
let abnormalProd = require("./task/abnormalProd");

// 人工验证(该部分处理逻辑移至前台，此处不再做测试)
// let manualCheck = require("./task/manualCheck");

// 立体库测试
let wms = require("./wmsTest");

// 机台通知连续废
let multiWeak = require("./task/multiWeak");

const mainThread = async () => {
  // 调试完毕
  // await wms.init().catch(e => console.log(e));

  // 调试完毕-2018057全部通过。
  await abnormalProd.init();

  consola.info('1.异常品处理完毕\n');

  // 调试完毕
  await newProc.init().catch(e => console.log(e));
  consola.info('2.四新产品处理完毕\n');

  // 测试完毕
  await multiWeak.init();
  consola.info('3.连续废通知产品进度处理完毕\n\n');
}

const init = async () => {

  // 间隔时间 5 分钟。
  let timeInterval = 5 * 60 * 1000;
  let times = 1;

  consola.start('启动物流调度服务');
  mainThread();

  setInterval(() => {
    consola.start(`\n${lib.now()}: 第${times++}次采集`)
    mainThread();
    // 清除次数
    times = times > 1000 ? 1 : times;
  }, timeInterval);

};

module.exports = { init };