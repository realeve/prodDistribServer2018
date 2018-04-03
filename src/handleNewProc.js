let db = require("./util/db");
let R = require("ramda");
let wms = require("./util/wms");
let lib = require("./util/lib");
const consola = require("consola");

let stepIdx = 1;
const init = async () => {
  consola.start(`step${stepIdx++}: 获取四新任务列表`);
  let data = await db.getPrintNewprocPlan();
  if (data.rows === 0) {
    consola.info(`step${stepIdx++}: 四新任务列表为空`);
  }
  consola.success(`step${stepIdx++}: 共获取到${data.rows}条任务`);
  data.data.forEach((item, idx) => {
    consola.info(`       开始处理任务${idx + 1}/${data.rows}:`);
    handlePlanList(item);
  });
};

let getProcStream = id =>
  [
    { proc_stream_id: 0, proc_stream_name: "8位清分机全检" },
    { proc_stream_id: 1, proc_stream_name: "人工拉号" },
    { proc_stream_id: 2, proc_stream_name: "系统自动分配" }
  ][id];

let getLockReason = data => {
  let {
    date_type,
    machine_name,
    proc_name,
    ProductName,
    num1,
    num2,
    rec_date1
  } = data;

  let allCount = parseInt(num1, 10) + parseInt(num2, 10) + "万产品";
  let dateName = rec_date1.substr(0, 4) + "年" + rec_date1.substr(4, 2) + "月";
  if (date_type == "1") {
    allCount = "";
  }
  return `${machine_name}${ProductName.trim()}品${dateName}${allCount}${proc_name}验证计划`;
};

let handlePlanList = async data => {
  let today = lib.ymd();

  let {
    id,
    date_type,
    machine_name,
    num1,
    num2,
    proc_stream1,
    proc_stream2,
    rec_date1,
    rec_date2,
    complete_num,
    complete_status
  } = data;
  let reason = getLockReason(data);

  num1 = parseInt(num1, 10);
  num2 = parseInt(num2, 10);

  if (today < rec_date1) {
    consola.error(`exit:任务${rec_date1}尚未开始`);
    return;
  }
  const IS_DATE_RANGE = date_type == 1;
  let cartList1 = [],
    cartList2 = [];
  if (IS_DATE_RANGE) {
    cartList1 = await db.getCartListWithDate({
      machine_name,
      rec_date1,
      rec_date2
    });
  } else {
    let cartList = await db.getCartList({ machine_name, rec_date1 });
    if (cartList.length <= num1) {
      cartList1 = cartList;
    } else {
      cartList1 = cartList.slice(0, num1);
      cartList2 = cartList.slice(num1, num2 + num1);
    }
  }

  // 立体库接口批量设置产品信息
  let result = await handleProcStream(cartList1, proc_stream1);
  result = await handleProcStream(cartList2, proc_stream2);

  // 当前日期信息大于结束时间时
  const TIME_RELEASED = today > rec_date2 && IS_DATE_RANGE;

  // 产品大万数大于初始设置值
  const CARTS_FINISHED = cartList1.length === num1 && cartList2.length >= num2;

  // 以上条件同时满足时，任务完成
  if (TIME_RELEASED && CARTS_FINISHED) {
    consola.success(`exit:任务${rec_date1}已经结束，此处更新任务状态`);
  }
};

let handleProcStream = async (carnos, procStream) => {
  if (carnos.length === 0) {
    return false;
  }
  let { proc_stream_name } = getProcStream(procStream);
  let procs = { carnos, checkType: proc_stream_name };

  consola.info(`设置工艺信息：`);
  consola.log(JSON.stringify(procs));

  let result = await wms.setProcs(procs);
  consola.success(result);
  return result;
};

module.exports = { init };
