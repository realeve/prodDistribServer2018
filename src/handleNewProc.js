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

  consola.success("读取到以下任务列表:" + JSON.stringify(data.data));

  consola.success(`step${stepIdx++}: 共获取到${data.rows}条任务`);
  data.data.forEach(async (item, idx) => {
    consola.info(`       开始处理任务${idx + 1}/${data.rows}:`);
    await handlePlanList(item);
  });
};

let getProcStream = id =>
  [
    { proc_stream_id: 0, proc_stream_name: "全检品", remark: "8位清分机全检" },
    { proc_stream_id: 1, remark: "人工拉号" },
    { proc_stream_id: 2, proc_stream_name: "码后核查", remark: "正常码后核查" },
    {
      proc_stream_id: 3,
      proc_stream_name: "码后核查",
      remark: "码后核查工艺验证 "
    },
    {
      proc_stream_id: 4,
      proc_stream_name: "自动分配(人工拉号或8位全检)"
    },
    {
      proc_stream_id: 5,
      proc_stream_name: "自动分配(人工拉号或码后核查验证)"
    },
    { proc_stream_id: 6, proc_stream_name: "补品", remark: "补票" }
  ][id];

let getLockReason = data => {
  let {
    date_type,
    machine_name,
    proc_name,
    ProductName,
    num1,
    num2,
    rec_date1,
    alpha_num
  } = data;

  if (date_type === "0" || date_type === "1") {
    let allCount = parseInt(num1, 10) + parseInt(num2, 10) + "万产品";
    let dateName =
      rec_date1.substr(0, 4) + "年" + rec_date1.substr(4, 2) + "月";
    if (date_type == "1") {
      allCount = "";
    }
    return `${machine_name}${ProductName}品${dateName}${allCount}${proc_name}验证计划`;
  }
  return `${ProductName}品${alpha_num}冠字${num1}至${num2} ${proc_name}验证计划`;
};

let handlePlanList = async data => {
  let {
    date_type,
    machine_name,
    num1,
    num2,
    proc_stream1,
    proc_stream2,
    rec_date1,
    rec_date2,
    alpha_num,
    ProductName
  } = data;

  let taskName = getLockReason(data);
  consola.info("开始任务信息：" + taskName);
  num1 = parseInt(num1, 10);
  num2 = parseInt(num2, 10);

  let today = lib.ymd();
  if (today < rec_date1) {
    consola.error(`exit:任务${rec_date1}尚未开始`);
    return;
  }

  let cartList1 = [],
    cartList2 = [];

  switch (parseInt(date_type, 10)) {
    case 1:
      // IS_DATE_RANGE
      cartList1 = await db.getCartListWithDate({
        machine_name,
        rec_date1,
        rec_date2
      });
      break;
    case 2:
      // IS_GZ_CHECK
      cartList1 = await db.getCartListWithGZ({
        prod_name: ProductName,
        gz: alpha_num,
        start_no: num1,
        end_no: num2
      });
      break;
    case 0:
    default:
      let cartList = await db.getCartList({ machine_name, rec_date1 });
      if (cartList.length <= num1) {
        cartList1 = cartList;
      } else {
        cartList1 = cartList.slice(0, num1);
        cartList2 = cartList.slice(num1, num2 + num1);
      }
      break;
  }

  // 立体库接口批量设置产品信息
  await handleProcStream(cartList1, proc_stream1);
  if (cartList2.length) {
    await handleProcStream(cartList2, proc_stream2);
  }

  // 设置完成进度
  handleFinishStatus({ data, cartList1, cartList2, taskName });
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
  // 记录日志信息
  await db.addPrintWmsLog([
    {
      remark: JSON.stringify({ carnos, procStream }),
      rec_time: lib.now(),
      return_info: JSON.stringify(result)
    }
  ]);

  return result;
};

// 更新完成状态
let handleFinishStatus = async ({ data, cartList1, cartList2, taskName }) => {
  let isGZFinish = ({ ProductName, num1, num2, cartList }) => {
    let kNum = 35;
    if (ProductName.includes("9602") || ProductName.includes("9603")) {
      kNum = 40;
    }
    return cartList.length >= (num2 - num1) / kNum + 1;
  };

  let today = lib.ymd();
  let { id, date_type, num1, num2, rec_date2, ProductName } = data;

  const IS_CARTS_COUNT = date_type == 0;
  const IS_DATE_RANGE = date_type == 1;
  const IS_GZ_CHECK = date_type == 2;
  // 从某段时间开始：产品大万数大于初始设置值
  const CARTS_FINISHED =
    IS_CARTS_COUNT && cartList1.length === num1 && cartList2.length >= num2;

  // 某段时间的所有产品：当前日期信息大于结束时间时
  const TIME_RELEASED = IS_DATE_RANGE && today > rec_date2;

  const IS_ALL_GZ_FINISHED =
    IS_GZ_CHECK && isGZFinish({ ProductName, num1, num2, cartList: cartList1 });

  let complete_num = cartList1.length + cartList2.length;
  let complete_status = 0;
  let update_time = lib.now();
  // 以上条件同时满足时，任务完成
  if (TIME_RELEASED || CARTS_FINISHED || IS_ALL_GZ_FINISHED) {
    complete_status = 1;
    consola.success(`exit:任务${taskName}已经结束，此处更新任务状态`);
  }

  // 更新数据库状态及实时处理进度
  await db.setPrintNewprocPlan({
    complete_num,
    complete_status,
    update_time,
    _id: id
  });
  console.info(complete_num, complete_status);
};

module.exports = { init };
