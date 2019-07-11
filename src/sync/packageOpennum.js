let db = require('../util/db_sync_package_opennum');
let db2 = require('../util/db_excellentProdLine');

let R = require('ramda');
let moment = require('moment');
const { handleOpenNum } = require('./fakeAfterSinyin');
const lib = require('../util/lib');

let task_name = '同步人工判废开包量信息至立体库';

// 是否打开开包量分流功能
let CHANGE_PROC_BY_OPENNUM = false;

// 是否需要记录
const needRecord = async (api) => {
  let curHour = parseInt(moment().format('HHMM'), 10);

  console.log(curHour);
  if (curHour > 0959 || curHour < 200) {
    console.log('当前时间无需处理精品线记录');
    return false;
  }

  // 当天是否已记录
  let { rows } = await db[api]();
  if (rows > 0) {
    console.log('无需处理，当天已记录');
    return false;
  }
  return true;
};

// 当前白名单中未同步的车号处理
const handleUnSyncCarts = async () => {
  let { data } = await db.getVCbpcWhitelist();
  handleCarts(data);
};

const handleCarts = async (taskList) => {
  taskList = R.pluck('cart')(taskList);
  for (let i = 0; i < taskList.length; i++) {
    console.log(`开包量：${task_name}:${i + 1}/${taskList.length}`);
    await handleMahouTask(taskList[i]);
    console.log(`开包量：${i + 1}/${taskList.length} 同步完成`);
  }
  console.log(task_name + '任务完成');
};

const asyncExOpennum = async () => {
  let syncData = await db.getCbpcBatchOpennumEx();
  if (syncData.rows === 0) {
    console.log('全部数据已同步');
    return;
  }
  for (let i = 0; i < syncData.rows; i++) {
    await handleExOpennum(syncData.data[i]);
    console.log(`完成第${i + 1}/${syncData.rows}条实际开包量信息同步`);
  }
};

const handleExOpennum = async ({ recid, cart }) => {
  let { data } = await db.getOcrContrastResult(cart);
  if (data.length === 0) {
    return;
  }
  await db.setCbpcBatchOpennum({ ...data[0], recid }).catch((e) => {
    console.log(e);
  });
};

const init = async () => {
  await handleUnSyncCarts();

  let syncData = await needRecord('gettblCbpcBatchOpennum');
  if (!syncData) {
    return;
  }
  let tstart = moment()
    .subtract(1, 'days')
    .format('YYYYMMDD');

  let { data: taskList } = await db.getQfmWipJobs({
    tstart,
    tend: tstart
  });
  handleCarts(taskList);
};

const handleMahouTask = async (cart) => {
  let { ex_opennum: opennum } = await handleOpenNum(cart);

  // 如果7T开包量大于200，直接转全检工艺;
  // if (opennum > 200 && cart[2] === '8') {

  // 经检封沟通，开包量180包以上自动转全检，针对所有工艺
  if (CHANGE_PROC_BY_OPENNUM && opennum >= 180) {
    await db2
      .addPrintWmsAutoproc([
        {
          cart,
          rec_time: lib.now(),
          remark: `智能精品线转全检品(开包量:${opennum})`
        }
      ])
      .catch((e) => {
        console.log(e);
      });
  }

  let params = {
    opennum,
    cart,
    rec_time: lib.now()
  };
  await db.addCbpcBatchOpennum(params);
};

module.exports = { init, asyncExOpennum };
