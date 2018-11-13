const axios = require('axios');

// 测试环境
const { dev } = require('./axios');

// 品种列表
// 10.8.1.25:100/api/254/8b9c382d56/5.html，建议随在库产品列表接口一起走
const ProdList = [
  {
    prod_id: '20',
    prod_name: '9606T'
  },
  {
    prod_id: '14',
    prod_name: '9606A'
  },
  {
    prod_id: '1',
    prod_name: '9602A'
  },
  {
    prod_id: '13',
    prod_name: '9605A'
  },
  {
    prod_id: '2',
    prod_name: '9603A'
  },
  {
    prod_id: '4',
    prod_name: '9607A'
  },
  {
    prod_id: '15',
    prod_name: '9607T'
  },
  {
    prod_id: '3',
    prod_name: '9604A'
  }
];

let host = dev
  ? 'http://mactest.cdyc.cbpm:8080/wms/if'
  : 'http://cognosdb.cdyc.cbpm:8080/wms/if';

// host = "http://10.8.60.202:8080/wms/if";
// host = "http://mactest.cdyc.cbpm:8080/wms/if";

// 公共函数
// 根据库房id获取库房名
let getStoreRoom = (org) =>
  [
    { orgid: 1445, orgname: '数管2号库房' },
    { orgid: 1446, orgname: '数管3号库房' },
    { orgid: 1447, orgname: '数管4号库房' },
    { orgid: 1448, orgname: '数管5号库房' },
    { orgid: 1449, orgname: '数管6号库房' },
    { orgid: 1450, orgname: '数管7号库房' },
    { orgid: 1451, orgname: '数管8号库房' },
    { orgid: 1452, orgname: '数管9号库房' },
    { orgid: 1453, orgname: '数管10号库房' },
    { orgid: 1455, orgname: '数管11号库房' },
    { orgid: 1460, orgname: '立体库' },
    { orgid: 250, orgname: '检封库房大张号票库区' },
    { orgid: 251, orgname: '检封库房小张号票库区' },
    { orgid: 252, orgname: '检封库房补票库区' }
  ].find(({ orgid }) => orgid === org);

// 工序列表
let getProcStatus = (psc) =>
  [
    { pscode: 'wzbz', psname: '物资白纸' },
    { pscode: 'czbz', psname: '钞纸白纸' },
    { pscode: 'bz', psname: '白纸' },
    { pscode: 'jydg', psname: '胶一印待干品' },
    { pscode: 'jyyp', psname: '胶一印品' },
    { pscode: 'jedg', psname: '胶二印待干品' },
    { pscode: 'jeyp', psname: '胶二印品' },
    { pscode: 'sydg', psname: '丝印待干品' },
    { pscode: 'syyp', psname: '丝印品' },
    { pscode: 'wydg', psname: '凹一印待干品' },
    { pscode: 'wyyp', psname: '凹一印品' },
    { pscode: 'wedg', psname: '凹二印待干品' },
    { pscode: 'weyp', psname: '凹二印品' },
    { pscode: 'dhdg', psname: '大张号票待干品' },
    { pscode: 'dzhp', psname: '大张号票' }
  ].find(({ pscode }) => pscode === psc);

let reasonCode = [
  { reason_code: 'incomplete', reason_desc: '未完工' },
  { reason_code: 'q_handCheck', reason_desc: '人工全检锁车' },
  { reason_code: 'q_newProc', reason_desc: '四新批量锁车' },
  { reason_code: 'q_abnormalProd', reason_desc: '异常品锁车' },
  {
    reason_code: 'q_batchLock',
    reason_desc: '人工批量锁车,不拉号'
  }
];

// 数据库交互

// 1.批量车号在库查询
// let [carno1,carno2,carno3] = carnos
let getStockStatus = async (carnos) => {
  let data = await axios({
    method: 'post',
    url: host + '/carnoQ',
    data: {
      carnos
    }
  }).then((res) => res.data);

  // 返回值：车号，库房ID，批次数量，工序code
  // let json = JSON.stringify([
  //   { pscode: "bz", orgid: "1449", carno: "1840K000", quantity: "350000" }
  // ]);

  return data;
};

// 5.批量锁车
/*let [{carno,reason_code}] = carnos

问：此处 reason_code，原因状态码，啥意思

答：此处 reason_code可以从接口3锁车原因列表中获得，比如人工全检锁车，我们预设的 reason_code 是 handCheck 
你也可以通过接口4注册新的锁车原因。你在质量管理系统中发现某一特定批次的产品可能有缺陷，你想对这一批次进行锁车，并特别标注出来，
那么你可以先注册一个锁车原因，然后将这一批次产品以新注册的原因锁车，并通知对应人员关注因xxxx锁车的这一批次。
库管人员、拉号人员、质检人员根据你通知的锁车原因（实际就是批次）在数管系统中可以找到这一批次进行后续处理。
比如，拉号人员可以关注这一批次的车号，然后指定车号出库进行检查。
锁车以后必须将锁住的批次通知到后续处理的人员，这些批次的产品才能被呼出。
被锁定的车号只能以指定车号方式呼出，否则只能等待解除锁定才能被呼出。

接口调整 20180401
批量锁车的应用场景一般是同一原因，批量锁一批车号，将车号列表和reason_code分离比较合理，reason_code为int类型，表示id。
建立以下原因：
1.人工抽检
2.异常产品转全检
3.四新验证
4.其它
*/
let setBlackList = async ({ carnos, reason_code, log_id }) => {
  let data = await axios({
    method: 'post',
    url: host + '/lockH',
    data: {
      carnos,
      reason_code,
      log_id
    }
  }).then((res) => res.data);

  // 返回值：未处理车号列表，已处理车号列表
  // let json = JSON.stringify({
  //   unhandledList: ["1880A211", "1880A232"],
  //   handledList: ["1820A211", "1820A233"]
  // });

  return data;
};

// 批量取消人工拉号状态
const unlockCart = async (carno) =>
  await axios({
    url: 'http://10.8.1.27:4000/api/manual_status',
    params: {
      carno
    }
  }).then((res) => res);

// 2.批量车号设定质检工艺
/*checkType:'全检品'||'码后核查'||'补品'
需修改：8位清分机全检 || 人工拉号 || 系统自动分配
[
  { proc_stream_id: 0, proc_stream_name: "8位清分机全检" },
  { proc_stream_id: 1, proc_stream_name: "人工拉号" },
  { proc_stream_id: 2, proc_stream_name: "系统自动分配" }
]
carnos:[carno1,carno2,carno3]*/
let setProcs = async ({ checkType, carnos, log_id }) => {
  let data = await axios({
    method: 'post',
    url: host + '/carnoH',
    data: {
      checkType,
      carnos,
      log_id
    }
  }).then((res) => res.data);

  // 全检品单独处理,需取消人工拉号
  if (checkType == 0) {
    unlockCart(carnos);
  }
  return data;

  // // 返回值：未处理车号列表，已处理车号列表
  // let json = JSON.stringify({
  //   unhandledList: ["1880A211", "1880A232"],
  //   handledList: ["1820A211", "1820A233"]
  // });
  // return json;
};

// 3 锁车原因列表
let getBlackReason = async () => {
  let data = await axios({
    method: 'post',
    url: host + '/lockQ'
  }).then((res) => res.data);

  // 返回值：未处理车号列表，已处理车号列表
  // 见接口5的回答
  // let json = JSON.stringify([
  //   { reason_code: "这里的枚举是哪些", reason_desc: "对应的描述信息" }
  // ]);

  return data;
};

// 4 添加锁车原因
// 状态码，锁车描述
let addBlackReason = async ({ reason_code, reason_desc }) => {
  let data = await axios({
    method: 'post',
    url: host + '/lockR',
    data: {
      reason_code,
      reason_desc
    }
  }).then((res) => res.data);

  // 返回值：
  // let json = JSON.stringify({ status: false, errMsg: "失败原因" });
  // let json = JSON.stringify([
  //   {
  //     status: true,
  //     reason_code: 15
  //   },
  //   {
  //     status: false,
  //     errMsg: "失败原因"
  //   }
  // ]);

  return data;
};

// 6.批量解锁
// let [carno1,carno2,carno3] = carnos
let setWhiteList = async (carnos) => {
  let data = await axios({
    method: 'post',
    url: host + '/unlockH',
    data: {
      carnos
    }
  }).then((res) => res.data);

  // 返回值：未处理车号列表，已处理车号列表
  // let json = JSON.stringify({
  //   unhandledList: ["1880A211", "1880A232"],
  //   handledList: ["1820A211", "1820A233"]
  // });

  return data;
};

// 码后验证。review:1设置验证,0取消验证
let setReviewList = async ({ carnos, review, log_id }) => {
  let data = await axios({
    method: 'post',
    url: host + '/reviewH',
    data: {
      carnos,
      review,
      log_id
    }
  }).then((res) => res.data);
  return data;
};

const updateWmsOpenNum = (carts) => {
  let data = typeof carts == 'object' ? [carts] : carts;
  return axios({
    method: 'post',
    url: host + '/addOpennum',
    data
  }).then((res) => res.data.result);
};

module.exports = {
  getStoreRoom,
  getProcStatus,
  getStockStatus,
  setProcs,
  getBlackReason,
  addBlackReason,
  setBlackList,
  setWhiteList,
  setReviewList,
  updateWmsOpenNum
};
