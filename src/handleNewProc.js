let db = require("./util/db");
let R = require("ramda");
let wms = require("./util/wms");
let lib = require("./util/lib");

let stepIdx = 1;
const init = async () => {
  console.log(`step${stepIdx++}: 获取四新任务列表`);
  let data = await db.getPrintNewprocPlan();
  if (data.rows === 0) {
    console.log(`step${stepIdx++}: 四新任务列表为空`);
  }
  console.log(`step${stepIdx++}: 共获取到${data.rows}条任务`);
  data.data.forEach((item, idx) => {
    console.log(`       开始处理任务${idx + 1}/${data.rows}:`);
    handlePlanList(item);
  });
};

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
  console.log(reason);

  if (today < rec_date1) {
    console.log(`exit:任务${rec_date1}尚未开始`);
    return;
  }

  let cartList = [];
  if (date_type == 0) {
    cartList = await db.getCartList({ machine_name, rec_date1 });

    return;
  }

  cartList = await db.getCartListWithDate({
    machine_name,
    rec_date1,
    rec_date2
  });

  const TASK_END = today > rec_date1;
  if (TASK_END) {
    console.log(`exit:任务${rec_date1}已经结束`);
  }
};

module.exports = { init };
