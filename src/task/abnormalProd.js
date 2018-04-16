let db = require("../util/db");
let R = require("ramda");
let wms = require("../util/wms");
let lib = require("../util/lib");
const consola = require("consola");
const procHandler = require("../util/procHandler");

const init = async () => {
  let task_name = "异常品工艺处理";
  await procHandler.recordHeartbeat(task_name);

  // 读取未处理的异常品车号，如果有多个工艺，按最后一次添加的为准
  let { data } = await db.getPrintAbnormalProd();
  console.log(data);

  if (R.isNil(data) || data.length === 0) {
    consola.info("所有任务处理完毕，下个周期继续");
    return;
  }

  // 处理所有车号信息
  data.forEach(handlePlanList);
};

const handlePlanList = async ({ cart_number, proc_stream }) => {
  let result = await procHandler.handleProcStream({
    carnos: [cart_number],
    proc_stream,
    check_type: "异常品处理",
    reason_code: "q_abnormalProd"
  });
  console.log("工艺流程处理完毕");

  await db.setPrintAbnormalProd(cart_number);
  return result;
};

module.exports = { init };
