let { axios } = require("../../util/axios");
let task_name = "尼泊尔装箱生产数据迁移";
const R = require("ramda");
const lib = require("./lib");

/** NodeJS服务端调用：
 *   齐路：MACHINE_PROCESS表中 confirmed字段用于与外部系统的同步后信息确认，目前此处未用。
 * 
 *   @database: { MES系统_生产环境 }
 *   @desc:     { 尼泊尔装箱完工品 }
 *  with detail as (SELECT event_id,carnumber FROM udt_pp_MachineProcess WHERE TargetProcess = 24 AND prod_id = 215958 AND Confirmed = 0 AND endtime >= dateadd(DAY ,- 2,getdate())) SELECT c.event_id,carno cart,a.CrownWord + a.StartNumeric "from",( CASE WHEN CAST (a.EndNumeric AS INTEGER) < CAST (a.StartNumeric AS INTEGER) THEN b.CrownNo + a.EndNumeric ELSE a.CrownWord + a.EndNumeric END ) "to" FROM udt_CW_PrintCodeNotice a INNER JOIN udt_CW_CrownWordContainerNoNoticed b ON a.CWCNN_Id = b.id inner join detail c on a.CarNo=c.carnumber AND a.carno in (select carnumber from detail) 
 * {
  "data": [{
    "event_id": "3017738",
    "cart": "2010A002",
    "from": "B82000001",
    "to": "B82350000"
  }],
  "rows": 1,
  "dates": [],
  "ip": "10.8.60.203",
  "header": ["cart", "from", "to"],
  "title": "尼泊尔装箱完工品",
  "time": "558.197ms",
  "serverTime": "2020-08-25 10:31:59",
  "source": "数据来源：MES系统_生产环境",
  "hash": "W/\"f0f16e927d1123a9346b90aab3b2fe78\""
}
 */
const getUdtPpMachineprocess = () =>
  axios({
    url: "/1150/e9e71e216b.json",
  });

/**
 *   @database: { MES系统_生产环境 }
 *   @desc:     { 更新装箱NRB产品数据同步状态 }
 */
const setUdtPpMachineprocess = (event_id) =>
  axios({
    url: "/1151/d6af32bf4b.json",
    params: {
      event_id,
    },
  });

const setEWMInfo = (info) => {
  return axios({
    url: "/1133/2a03bea680.json",
    params: info,
  }).then((res) => {
    if (res.data && res.data[0].success == 0) {
      return false;
    }
    return true;
  });
};

// 处理接头冠字逻辑
const handleCaseNo = async (data, event_id) => {
  let first = R.head(data),
    last = R.last(data);

  // 非接头冠字，正常处理；
  if (first.head === last.head) {
    return await printCaseNos(data, event_id);
  }
  // 接头冠字分批次处理
  let idx = R.findIndex(R.propEq("head", last.head))(data);
  let case1 = R.slice(0, idx)(data),
    case2 = R.slice(idx, 7)(data);

  await printCaseNos(case1);
  return await printCaseNos(case2, event_id);
};

const printCaseNos = async (data, event_id) => {
  if (!data || data.length === 0) {
    return false;
  }

  let ewmInfo = {
    gz: data[0].head.replace(/\d.*/, ""),
    from: Number(data[0].ewmCaseNo),
    to: Number(data[data.length - 1].ewmCaseNo),
    quantity: data.length,
  };

  let rows = lib.getMultiRows({ action: "D", info: ewmInfo });

  console.info("二维码数据", rows);
  // 数据写至二维码系统，成功后更新MES系统状态
  return setEWMInfo(rows)
    .catch((err) => {
      console.error({
        message: "二维码数据写入失败",
        description: "二维码数据写入失败,请联系系统管理员.",
      });
    })
    .then((success) => success && setUdtPpMachineprocess(event_id));
};

// 处理单个任务
const handleTaskItem = async (state) => {
  let _data = lib.calcArr(state.from, 7, state.str, 50000);
  await handleCaseNo(_data, state.event_id);
};

const init = async () => {
  let res = await getUdtPpMachineprocess();
  if (res.rows === 0 || R.isNil(res.data[0].from)) {
    res.rows = 0;
    return res;
  }
  let tasklist = lib.handleData(res);
  for (let i = 0; i < tasklist.length; i++) {
    console.log(`${task_name}:${i + 1}/${tasklist.length}`);
    await handleTaskItem(tasklist[i]);
  }
  console.info(`${task_name} 数据处理完成`);
};

module.exports = { init };
