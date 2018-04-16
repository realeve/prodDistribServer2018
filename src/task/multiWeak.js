let db = require("../util/db");
let R = require("ramda");
let wms = require("../util/wms");
let lib = require("../util/lib");
const consola = require("consola");
const procHandler = require("../util/procHandler");

let task_name = "机台连续废通知";
const init = async () => {
  consola.success("开始任务：" + task_name);
  let result = await procHandler.recordHeartbeat(task_name);

  let { data } = await db.getPrintMachinecheckMultiweak();

  if (R.isNil(data) || data.length === 0) {
    consola.info("所有任务处理完毕，下个周期继续");
    return;
  }

  // 处理所有车号信息
  // data.forEach(handlePlanList);
  handlePlanList(data);
  //
};

const handlePlanList = async planList => {
  // { cart_number, id, last_proc }
  let cartnos = R.map(R.prop("cart_number"), planList);
  console.log(cartnos);
  let { data } = await db.getViewCartfinder({ cart1: cartnos, cart2: cartnos });
  if (R.isNil(data) || data.length === 0) {
    return;
  }

  planList.forEach(async ({ cart_number, id, last_proc }) => {
    let curProdInfo = R.find(R.propEq("cart_number", cart_number))(data);

    // 返回最新的工序信息
    let curProc = R.propOr("last_proc", false)(curProdInfo);
    // 工序未更新时，不处理
    if (curProc == last_proc) {
      return;
    }
    let { machine_name, rec_time } = curProdInfo;
    // 更新当前车号列表
    let res = await db.setPrintMachinecheckMultiweak({
      last_proc,
      last_machine: machine_name,
      last_rec_time: rec_time,
      _id: id
    });
    // 此处要判断是否更新成功

    // 根据cart_id推送信息至工艺员
    await pushData(id);

    await publishQualityInfo({ id, last_proc });

    // 是否已完成
    if (["抽查", "裁封"].includes(last_proc)) {
      await db.setPrintMachinecheckMultiweakStatus(id);
    }
  });
};

const getPushInfoById = async id => {
  let { data } = await db.getPrintMachinecheckMultiweakById(id);
  if (R.isNil(data) || data.length === 0) {
    consola.log("推送信息查询失败");
    return false;
  }
  let {
    proc_name,
    machine_name,
    captain_name,
    cart_number,
    fake_type,
    fake_num,
    last_proc,
    last_machine,
    last_rec_time
  } = data;
  let pushTextDesc = `【${proc_name}工序】,${machine_name}${captain_name}机台,车号${cart_number},约${fake_num}开${fake_type}产品已于 ${last_rec_time} 进入${last_proc}${last_machine}机台生产，请注意关注。`;
  return pushTextDesc;
};
// 根据cart_id推送信息至工艺员
const pushData = async id => {
  let pushText = await getPushInfoById(id);
  if (!pushText) {
    return;
  }
  // 增加数据推送接口
  consola.success("此处需要推送消息");
};

// 发布质量信息
const publishQualityInfo = async ({ id, last_proc }) => {
  // 仅发布印码信息
  if (last_proc !== "印码") {
    return;
  }

  let pushText = await getPushInfoById(id);
  if (!pushText) {
    return;
  }

  // 将此信息发布至质量平台

  // 如果这万产品属于机台通知了连续废的，在印码工序刷卡出库的时候通知推送，质量平台转发信息至工艺员/机检人员。
};

module.exports = { init };
