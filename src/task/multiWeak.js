let db = require("../util/db");
let R = require("ramda");
let wms = require("../util/wms");
let lib = require("../util/lib");
// const consola = require("consola");
const procHandler = require("../util/procHandler");

let task_name = "机台连续废通知";

/**
 * @desc:机台连续废通知，初始化。
 * 按数据库的CRUD，具体流程如下：
 * 1.心跳记录，进入该流程；
 * 2.获取未生产完毕的车号列表;
 * 3.依次对以上列表中的任务处理。
 */
const init = async () => {
  console.log("开始任务：" + task_name);
  let result = await procHandler.recordHeartbeat(task_name);

  let { data } = await db.getPrintMachinecheckMultiweak();

  if (R.isNil(data) || data.length === 0) {
    console.info("所有任务处理完毕，下个周期继续");
    return;
  }

  // 处理所有车号信息
  // data.forEach(handlePlanList);
  handlePlanList(data);
  //
};

const handlePlanList = async planList => {
  let cartnos = R.map(R.prop("cart_number"), planList);

  // 批量读取车号最近生产工序
  let { data } = await db.getViewCartfinder({ cart1: cartnos, cart2: cartnos });
  if (R.isNil(data) || data.length === 0) {
    return;
  }

  // 处理通知的所有产品
  planList.forEach(item => handlePlanItem(item, data));
};

/**
 * 处理每万信息,流程如下 ：
 * 1.读取该万产品最近生产的工序、设备、生产时间；
 * 2.如果工序信息无变更则退出处理；
 * 3.如果工序信息变更，先更新工序、设备、生产时间等信息；
 * 4.推送该万产品信息至工艺员（由立体库在出库时提供推送接口，服务端选择对推送消息处理）；
 * 5.发布信息至工艺质量管理平台（此处只处理进入印码流程的产品）；
 * 6.如果当前工艺为抽查（清分机）或检封（自动线），该万产品生产完成，更新状态信息，下次处理不再继续。
 * */

const handlePlanItem = async ({ cart_number, id, last_proc }, data) => {
  // 返回当前大万生产信息
  let curProdInfo = R.find(R.propEq("cart_number", cart_number))(data);

  // 返回最新的工序信息
  // let curProc = R.propOr("last_proc", false)(curProdInfo);
  let curProc = Reflect.has(curProdInfo, 'last_proc') ? curProdInfo.last_proc : 'last_proc';


  // 工序未更新时，不处理
  if (curProc == last_proc) {
    return;
  }

  let { machine_name, rec_time } = curProdInfo;
  // 更新当前车号信息，记录最近生产工序、机台、生产时间
  let res = await db.setPrintMachinecheckMultiweak({
    last_proc: curProc,
    last_machine: machine_name,
    last_rec_time: rec_time,
    _id: id
  });

  // 此处要判断是否更新成功
  if (res.rows == 0 || res.data[0].affected_rows == 0) {
    console.log('数据更新失败:')
    console.log({
      last_proc,
      last_machine: machine_name,
      last_rec_time: rec_time,
      _id: id
    })
    return;
  }

  // 根据cart_id推送信息至工艺员
  // 由于机台作业系统中信息延迟，需在机台领用产品出库的时候立即触发，故此处不做消息推送，在服务端通过接口单独处理。
  // await pushDataByRTX(id);

  switch (curProc) {
    case "印码":
      // 消息推送在服务端处理
      // await publishQualityInfo({ id, last_proc });
      break;
    case "抽查":
    case "裁封":
      await db.setPrintMachinecheckMultiweakStatus(id);
      break;
    default:
      break;
  }
};

// 获取待推送的文本内容
// const getPushInfoById = async id => {
//   let { data } = await db.getPrintMachinecheckMultiweakById(id);
//   if (R.isNil(data) || data.length === 0) {
//     consola.log("推送信息查询失败");
//     return false;
//   }
//   let {
//     proc_name,
//     machine_name,
//     captain_name,
//     cart_number,
//     fake_type,
//     fake_num,
//     last_proc,
//     last_machine,
//     last_rec_time
//   } = data;
//   let pushTextDesc = `【${proc_name}工序】,${machine_name}${captain_name}机台,车号${cart_number},约${fake_num}开${fake_type}产品已于 ${last_rec_time} 进入${last_proc}${last_machine}机台生产，请注意关注。`;
//   return pushTextDesc;
// };

// 根据cart_id推送信息至工艺员
// const pushDataByRTX = async id => {
//   // 如果这万产品属于机台通知了连续废的，在印码工序刷卡出库的时候通知推送，质量平台转发信息至工艺员/机检人员。
//   console.log("该部分信息由服务端处理，此处不再处理");
//   return;

//   let pushText = await getPushInfoById(id);
//   if (!pushText) {
//     return;
//   }
//   // 增加数据推送接口
//   console.log("此处需要推送消息");
// };

// 发布质量信息
// const publishQualityInfo = async ({ id, last_proc }) => {
//   let pushText = await getPushInfoById(id);
//   if (!pushText) {
//     return;
//   }
//   // 将此信息发布至质量平台
//   // 该部分功能待添加
// };

module.exports = { init };