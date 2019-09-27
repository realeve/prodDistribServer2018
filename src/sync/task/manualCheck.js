let db = require('../util/db');
let R = require('ramda');
let wms = require('../util/wms');
let lib = require('../util/lib');
// const consola = require("consola");
const procHandler = require('../util/procHandler');

let task_name = '人工拉号自动排活';
const init = async () => {
  console.log('该部分功能移至前台，后台不做任务扫描');
  return;
  console.log('开始任务：' + task_name);
  let result = await procHandler.recordHeartbeat(task_name);

  let { data } = await db.getPrintSampleCartlist();

  if (R.isNil(data) || data.length === 0) {
    console.info('所有任务处理完毕，下个周期继续');
    return;
  }

  // 处理所有车号信息
  // data.forEach(handlePlanList);
  handlePlanList(data[0]);
  //
};

const handlePlanList = async ({ cart_number }) => {
  let result = await procHandler.handleProcStream({
    carnos: [cart_number],
    proc_stream: 1,
    check_type: task_name,
    reason_code: '0576', //"q_handCheck",
    task_id: 0
  });
  console.log(result);
  // await db.setPrintAbnormalProd(cart_number);
  return result;
};

module.exports = { init };
