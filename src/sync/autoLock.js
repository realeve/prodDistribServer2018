let { axios } = require("../util/axios");
let moment = require("moment");

let task_name = "3T对印自动锁图";

const getCbpcAutosyncLog = () =>
  axios({
    url: "/1030/20b3a06389.json",
    params: {
      task_type: task_name,
    },
  });
const addCbpcAutosyncLog = (affected_rows) =>
  axios({
    url: "/1031/5039fac3a0.json",
    params: {
      type: task_name,
      affected_rows,
    },
  });

/**
 *   @database: { 全幅面 }
 *   @desc:     { 昨日生产的3T对印产品置为二次实废 }
 */

const setQfmQaInspectSlave = () =>
  axios({
    url: "/1029/4a5c718c88.json",
  });

// 是否需要记录
const needRecord = async () => {
  let curHour = parseInt(moment().format("HHMM"), 10);

  if (curHour > 0959 || curHour < 200) {
    console.log("当前时间无需处理锁图记录");
    return false;
  }

  // 当天是否已记录
  let { rows } = await getCbpcAutosyncLog();
  if (rows > 0) {
    console.log("无需处理，当天已记录");
    return false;
  }
  return true;
};

const init = async () => {
  let syncData = await needRecord();
  if (!syncData) {
    return;
  }

  // 处理数据
  let {
    data: [{ affected_rows }],
  } = await setQfmQaInspectSlave();
  console.log("锁图处理完成");
  if (affected_rows > 0) {
    return await addCbpcAutosyncLog(affected_rows);
  }
  return false;
};

module.exports = { init };
