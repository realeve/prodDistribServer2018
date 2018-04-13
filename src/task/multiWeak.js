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

const handlePlanList = async data => {
  // { cart_number, id, last_proc }
  let cartnos = R.map(R.prop("cart_number"), data);
  console.log(cartnos);
  let res = await db.getViewCartfinder({ cart1: cartnos, cart2: cartnos });
  console.log(res);
};

module.exports = { init };
