const lib = require('./util/lib');

const syncSeriousImg = require('./sync/syncSeriousImg');
const manualCheck = require('./sync/manualCheck');
const cartInfo = require('./sync/cartInfo');
const imgVerify = require('./sync/imgVerify');

const mainThread = async() => {

    // 同步人工判废黑图数据
    // 20181031 已完成
    await manualCheck.updateHisData().catch(e => {
        console.log(e)
    });

    // 特征图像判废结果同步
    await imgVerify.init().catch(e => {
        console.log(e)
    })

    // 生产信息同步
    await cartInfo.init().catch(e => {
        console.log(e)
    });

    // 人工判废结果同步
    await manualCheck.init().catch(e => {
        console.log(e)
    });

    // 严重废锁图同步
    await syncSeriousImg.init().catch(e => {
        console.log(e)
    });
};

const init = async() => {
    // 间隔时间 5 分钟。
    let timeInterval = 5 * 60 * 1000;
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