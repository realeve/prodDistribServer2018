const lib = require('./util/lib');

let syncSeriousImg = require('./sync/syncSeriousImg');
const manualCheck = require('./sync/manualCheck');

const mainThread = async () => {
  // 人工判废结果同步
  await manualCheck.init();

  // 同步人工判废历史数据
  await manualCheck.updateHisData();

  // 严重废锁图同步
  await syncSeriousImg.init();
};

const init = async () => {
  // 间隔时间 1 分钟。
  // 此处设为100分钟，预计为12000条历史数据同步的时间，完成后将200改为1；
  let timeInterval = 200 * 60 * 1000;
  let times = 1;

  console.info('启动数据同步服务');
  mainThread();

  setInterval(() => {
    console.info(`\n${lib.now()}: 第${times++}次采集`);
    mainThread();
    // 清除次数
    times = times > 1000 ? 1 : times;
  }, timeInterval);
};

module.exports = { init };
