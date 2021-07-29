const lib = require("./util/lib");
const syncGZProduct = require("./sync/gzProduct");
const syncSeriousImg = require("./sync/syncSeriousImg");
const manualCheck = require("./sync/manualCheck");
const cartInfo = require("./sync/cartInfo");
const imgVerify = require("./sync/imgVerify");
const fakeAfterSinyin = require("./sync/fakeAfterSinyin");
const openNum2Wms = require("./sync/openNum2Wms");

const noteAnay = require("./sync/noteAnay");

const wasterCompleteLog = require("./task/autoWasterComplete");

const box_package = require("./sync/box_package");

const excellentProdLine = require("./task/excellentProdLine");

const packageOpennum = require("./sync/packageOpennum");

const tubu = require("./task/tubu");

const tubuManualCheck = require("./sync/tubuManualCheck");

// 3T自动锁实废
const autoLock3T = require("./sync/autoLock");

// NRB10装箱逻辑处理
const nepal = require("./sync/nepal");

// OCR同步
const ocr = require('./sync/ocrsync')

const handleErr = ({ response }) =>
  console.log({ status: response.status, statusText: response.statusText });

const mainThread = async () => {
  await ocr.init().catch(handleErr)

  await syncGZProduct.init().catch(handleErr);

  await nepal.init().catch(handleErr);

  await autoLock3T.init().catch((e) => {
    console.log(e);
  });

  // 生产信息同步
  await cartInfo.init().catch((e) => {
    console.log(e);
  });

  // 涂布人工判废结果回写
  await tubuManualCheck.init().catch((e) => {
    console.log(e);
  });

  // 涂布产品置完工状态
  await tubu.init().catch((e) => {
    console.log(e);
  });

  // 同步开包量信息用于精品线
  await packageOpennum.init().catch((e) => {
    console.log(e);
  });

  // 同步实际开包量
  await packageOpennum.asyncExOpennum().catch((e) => {
    console.log(e);
  });

  // 精品线
  await excellentProdLine.sync().catch((e) => {
    console.log(e);
  });

  // 装箱二维码系统
  await box_package.init().catch((e) => {
    console.log(e);
  });

  await wasterCompleteLog.init().catch((e) => {
    console.log(e);
  });

  await noteAnay.init().catch((e) => {
    console.log(e);
  });

  await openNum2Wms.init().catch((e) => {
    console.log(e);
  });

  // 丝印后由凹印产生的作废信息
  await fakeAfterSinyin.init().catch((e) => {
    console.log(e);
  });

  // 同步人工判废黑图数据
  // 20181031 已完成
  await manualCheck.updateHisData().catch((e) => {
    console.log(e);
  });
  // 人工判废结果同步
  await manualCheck.init().catch((e) => {
    console.log(e);
  });

  // 特征图像判废结果同步
  await imgVerify.init().catch((e) => {
    console.log(e);
  });

  // 严重废锁图同步
  // await syncSeriousImg.init().catch((e) => {
  //   console.log(e);
  // });
};

const init = async () => {
  // 间隔时间 20 分钟。
  let timeInterval = 20 * 60 * 1000;
  let times = 1;

  console.info("启动数据同步服务");
  mainThread();

  setInterval(() => {
    console.info(`\n${lib.now()}: 第${times++}次采集`);
    mainThread();
    // 清除次数
    times = times % 1000;
  }, timeInterval);
};

module.exports = { init };
