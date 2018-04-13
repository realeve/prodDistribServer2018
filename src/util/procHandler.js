let db = require("./db");
let lib = require("./lib");
let wms = require("./wms");
const consola = require("consola");
let R = require("ramda");

let getProcStream = id =>
  [
    { proc_stream_id: 0, proc_stream_name: "全检品", remark: "8位清分机全检" },
    { proc_stream_id: 2, proc_stream_name: "码后核查", remark: "正常码后核查" },
    {
      proc_stream_id: 4,
      proc_stream_name: "全检品",
      remark: "自动分配(人工拉号或8位全检)"
    },
    {
      proc_stream_id: 1,
      proc_stream_name: "人工拉号",
      remark: "人工拉号"
    },
    {
      proc_stream_id: 3,
      proc_stream_name: "码后核查工艺验证",
      remark: "码后核查工艺验证 "
    },
    {
      proc_stream_id: 5,
      proc_stream_name: "码后核查工艺验证",
      remark: "自动分配(人工拉号或码后核查验证)"
    },
    { proc_stream_id: 6, proc_stream_name: "补品", remark: "补票" }
  ][id];

// 记录产品预置工艺，实际设置工艺。
let recordRealProc = async (carnos, proc_stream_name, remark, check_type) => {
  let rec_time = lib.now();
  console.log("此处读取产品冠字信息");

  let insertData = carnos.map(cart_number => ({
    cart_number,
    gz_num: "",
    proc_plan: remark,
    proc_real: proc_stream_name,
    rec_time,
    check_type
  }));
  await db.addPrintWmsProclist(insertData);
};

// 人工拉号
let manualHandle = async carnos =>
  await wms.setBlackList({ carnos, reason_code: "handCheck" });

// 码后工艺验证
let mahouProcVerify = async carnos => {
  return 1;
};

// 设置工艺流程至立体库
let adjustProcInfo = async ({ proc_stream, proc_stream_name, carnos }) => {
  let result;
  // 全检品、补品、码后核查，直接设置到现有工艺
  if ([0, 2, 4, 6].includes(proc_stream)) {
    result = await wms.setProcs({ carnos, checkType: proc_stream_name });
  } else if ([3, 5].includes(proc_stream)) {
    result = await mahouProcVerify(carnos);
  } else {
    result = await manualHandle(carnos);
  }

  consola.success(result);
  // 记录日志信息
  await db.addPrintWmsLog([
    {
      remark: JSON.stringify({ carnos, proc_stream }),
      rec_time: lib.now(),
      return_info: JSON.stringify(result)
    }
  ]);
};

// 调整工艺流程
let handleProcStream = async ({ carnos, proc_stream, check_type }) => {
  if (carnos.length === 0) {
    return false;
  }

  // 工艺流转换
  let { proc_stream_name, remark } = getProcStream(proc_stream);

  // 记录实际工艺
  await recordRealProc(carnos, proc_stream_name, remark, check_type);

  // 设置工艺流程至立体库
  let result = await adjustProcInfo({
    carnos,
    proc_stream_name,
    proc_stream
  });

  console.log(result);

  return result;
};

const recordHeartbeat = async task_name => {
  let { data } = await db.getPrintWmsHeartbeat();
  let isFind = R.filter(R.propEq("task_name", task_name))(data);
  if (isFind.length) {
    // 更新服务心跳
    return await db.setPrintWmsHeartbeat({ rec_time: lib.now(), task_name });
  } else {
    // 记录服务心跳
    return await db.addPrintWmsHeartbeat({ rec_time: lib.now(), task_name });
  }
};

module.exports = {
  handleProcStream,
  recordHeartbeat
};
