const axios = require("axios");

// 测试环境
const dev = false;
let host = dev
  ? "http://mactest.cdyc.cbpm:8080/wms/if"
  : "http://mac.cdyc.cbpm:8080/wms/if";

// 公共函数
// 根据库房id获取库房名
let getStoreRoom = org =>
  [
    { orgid: 1445, orgname: "数管2号库房" },
    { orgid: 1446, orgname: "数管3号库房" },
    { orgid: 1447, orgname: "数管4号库房" },
    { orgid: 1448, orgname: "数管5号库房" },
    { orgid: 1449, orgname: "数管6号库房" },
    { orgid: 1450, orgname: "数管7号库房" },
    { orgid: 1451, orgname: "数管8号库房" },
    { orgid: 1452, orgname: "数管9号库房" },
    { orgid: 1453, orgname: "数管10号库房" },
    { orgid: 1455, orgname: "数管11号库房" },
    { orgid: 1460, orgname: "立体库" },
    { orgid: 250, orgname: "检封库房大张号票库区" },
    { orgid: 251, orgname: "检封库房小张号票库区" },
    { orgid: 252, orgname: "检封库房补票库区" }
  ].find(({ orgid }) => orgid === org);

// 工序列表
let getProcStatus = psc =>
  [
    { pscode: "wzbz", psname: "物资白纸" },
    { pscode: "czbz", psname: "钞纸白纸" },
    { pscode: "bz", psname: "白纸" },
    { pscode: "jydg", psname: "胶一印待干品" },
    { pscode: "jyyp", psname: "胶一印品" },
    { pscode: "jedg", psname: "胶二印待干品" },
    { pscode: "jeyp", psname: "胶二印品" },
    { pscode: "sydg", psname: "丝印待干品" },
    { pscode: "syyp", psname: "丝印品" },
    { pscode: "wydg", psname: "凹一印待干品" },
    { pscode: "wyyp", psname: "凹一印品" },
    { pscode: "wedg", psname: "凹二印待干品" },
    { pscode: "weyp", psname: "凹二印品" },
    { pscode: "dhdg", psname: "大张号票待干品" },
    { pscode: "dzhp", psname: "大张号票" }
  ].find(({ pscode }) => pscode === psc);

// 数据库交互

// 1.批量车号在库查询
// let [carno1,carno2,carno3] = carnos
let getStockStatus = async carnos => {
  let data = await axios({
    method: "post",
    url: host + "/carnoQ",
    data: {
      carnos
    }
  }).then(res => res.data);

  // 返回值：车号，库房ID，批次数量，工序code
  let json = JSON.stringify([
    { carno: "1880A211", orgid: "1450", quantity: 10000, pscode: "wydg" }
  ]);

  return data;
};

// 5.批量锁车
// let [{carno,reason_code}] = carnos
// 问：此处 reason_code，原因状态码，啥意思
let setBlackList = async carnos => {
  let data = await axios({
    method: "post",
    url: host + "/lockH",
    data: {
      carnos
    }
  }).then(res => res.data);

  // 返回值：未处理车号列表，已处理车号列表
  let json = JSON.stringify({
    unhandledList: ["1880A211", "1880A232"],
    handledList: ["1820A211", "1820A233"]
  });

  return data;
};

// 2.批量车号设定质检工艺
// checkType:'全检品'||'码后核查'||'补票'
// carnos:[carno1,carno2,carno3]
let setProcs = async ({ checkType, carnos }) => {
  let data = await axios({
    method: "post",
    url: host + "/carnoH",
    data: {
      checkType,
      carnos
    }
  }).then(res => res.data);

  // 返回值：未处理车号列表，已处理车号列表
  let json = JSON.stringify({
    unhandledList: ["1880A211", "1880A232"],
    handledList: ["1820A211", "1820A233"]
  });

  return data;
};

// 3 锁车原因列表
let getBlackReason = async () => {
  let data = await axios({
    method: "post",
    url: host + "/lockQ"
  }).then(res => res.data);

  // 返回值：
  let json = JSON.stringify([
    { reason_code: "这里的枚举是哪些", reason_desc: "对应的描述信息" }
  ]);

  return data;
};

// 4 添加锁车原因
// 状态码，锁车描述
let addBlackReason = async ({ reason_code, reason_desc }) => {
  let data = await axios({
    method: "post",
    url: host + "/lockR",
    data: {
      reason_code,
      reason_desc
    }
  }).then(res => res.data);

  // 返回值：
  let json = JSON.stringify({ status: false, errMsg: "失败原因" });

  return data;
};

// 6.批量解锁
// let [carno1,carno2,carno3] = carnos
let setWhiteList = async carnos => {
  let data = await axios({
    method: "post",
    url: host + "/unlockH",
    data: {
      carnos
    }
  }).then(res => res.data);

  // 返回值：未处理车号列表，已处理车号列表
  let json = JSON.stringify({
    unhandledList: ["1880A211", "1880A232"],
    handledList: ["1820A211", "1820A233"]
  });

  return data;
};

module.exports = {
  getStoreRoom,
  getProcStatus,
  getStockStatus,
  setProcs,
  getBlackReason,
  addBlackReason,
  setBlackList,
  setWhiteList
};
