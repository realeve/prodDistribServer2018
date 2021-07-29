let db = require("../util/db_sync_package_opennum");
let { axios } = require("../util/axios");
let R = require("ramda");
let moment = require("moment");

let task_name = "同步OCR开包量信息";
 

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 当天是否已经同步 }
 */
const getOcrdataOnlinelog = (tstart) =>
  axios({
    url: "/1370/83ec6d5441.json",
    params: {
      tstart,
    },
  });

const getOcrCartList = (params) =>
  axios({
    url: "/1369/44135a38a2.json",
    params,
  });

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 同步OCR开包量信息 }
 */
const addOcrdataOnline = (params) =>
  axios({
    url: "/1371/467dc8d517.json",
    params,
  })
    .then(({ data: [{ id }] }) => id)
    .catch((e) => {
      console.log(e);
    });

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 记录同步日志 }
 */
const addOcrdataOnlinelog = (params) =>
  axios({
    url: "/1372/d9715701b8.json",
    params,
  })
    .then(({ data: [{ id }] }) => id)
    .catch((e) => {
      console.log(e);
    });

// 是否需要记录
const needRecord = async (tstart) => {

  let curHour = parseInt(moment().format("HHMM"), 10);

  if (curHour > 0959 || curHour < 200) {
    console.log("当前时间无需" + task_name);
    return false;
  }

  // 当天是否已记录
  let { rows } = await getOcrdataOnlinelog(tstart);

  if (rows > 0) {
    console.log("无需处理，当天已记录");
    return false;
  }
  return true;
};

const getProd = (cart) => {
  let type = cart[3] == "5" ? "T" : "A";
  return "960" + cart[2] + type;
};

const handleExOpennum = async (cart) => {
  let { data } = await db.getOcrContrastResult(cart);
  if (data.length === 0 || data[0].ex_opennum == 0) {
    return;
  }
  let res = data[0];
  res = {
    cartnumber: cart,
    producttype: getProd(cart),
    ...res,
  };

  await addOcrdataOnline(res).catch((e) => {
    console.log(e);
  });
};

const handleCarts = async (taskList, tstart) => {
  taskList = R.pluck("cart")(taskList);
  for (let i = 0; i < taskList.length; i++) {
    console.log(`开包量：${task_name}:${i + 1}/${taskList.length}`);
    await handleExOpennum(taskList[i]);
    console.log(`开包量：${i + 1}/${taskList.length} 同步完成`);
  }

  addOcrdataOnlinelog({
    rec_date: tstart,
    cart_num: taskList.length,
  });

  console.log(task_name + "任务完成");
};

const init = async () => {
  let tstart = moment().subtract(1, "days").format("YYYYMMDD");
  let syncData = await needRecord(tstart);
  if (!syncData) {
    return;
  }

  handleHisData(tstart, tstart);
};

const handleHisData = async (tstart, tend) => {
  for (let i = tstart; i <= tend; i++) {
    console.log("处理：" + i);
    let { data: taskList } = await getOcrCartList({
      tstart: i,
      tend: i,
    });

    handleCarts(taskList, i);
    console.log("处理完成：" + i);
  }
};

module.exports = { init };
