let { axios } = require("../util/axios");
let moment = require("moment");

let task_name = "3T对印自动锁图";

/*
 2020-07-01 马可需求
 1. 1280,1296,4096分别代表 对印圈，对印5，黑图（补图及严重缺陷）置二次实废——8
 2. 除此之外的，同时 item_flag = 0(未判废)的产品，置为人工误废（1）
 3. 需要处理荧光缺陷（检测路数route_sheet_number为 15X，及17X），不能自动置人工误废。

 系统自动处理：
 1.对印及黑图实废
 2.机台已经判过的折纸不处理（结果为5或6）
 3.荧光不处理，由图核人员判废
 4.涂布（22X，23X）不处理
 5.剩下全部置误废
*/

const getCbpcAutosyncLog = () =>
  axios({
    url: "/1030/20b3a06389.json",
    params: {
      task_type: task_name,
    },
  });
const addCbpcAutosyncLog = (affected_rows, type) =>
  axios({
    url: "/1031/5039fac3a0.json",
    params: {
      type,
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

/**
 *   @database: { 全幅面 }
 *   @desc:     { 昨日生产的3T对应产品置为二次误废 }
 */
const setQfmQaInspectSlaveNotFake = () =>
  axios({
    url: "/1110/e9d815c9ea.json",
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
    await addCbpcAutosyncLog(affected_rows, "3T对印自动锁图");
  }

  // 置误废
  let {
    data: [{ affected_rows: rows2 }],
  } = await setQfmQaInspectSlaveNotFake();
  if (rows2 > 0) {
    await addCbpcAutosyncLog(affected_rows, "3T对印置误废");
  }

  return affected_rows + rows2 > 0;
};

module.exports = { init };
