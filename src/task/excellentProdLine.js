let R = require("ramda");
let db = require("../util/db_excellentProdLine");
let lib = require("../util/lib");
let moment = require("moment");
let wms = require("../util/wms");
let { addPrintWmsLog, setPrintWmsLog } = require("../util/db");

const filterCartsByProc = (proc, carts) =>
  R.compose(
    R.map(R.prop("cart_number")),
    R.filter(R.propEq("process", proc))
  )(carts);

// 兑换品自动转全检
const handleChangeCarts = async () => {
  let { data } = await db.getUdtTbWipinventory();
  if (data.length === 0) {
    return false;
  }

  // 如果当前有兑换品，自动转全检
  let cartList = R.map(R.prop(["cart"]))(data); // 获取车号列表
  let logInfo = await addPrintWmsLog([
    {
      remark: JSON.stringify(cartList),
      rec_time: lib.now()
    }
  ]);

  // 添加日志正常？
  if (logInfo.rows < 1 || logInfo.data[0].affected_rows < 1) {
    console.log("wms记录失败", logInfo);
    return false;
  }

  let log_id = logInfo.data[0].id;
  result = await wms.setProcs({
    carnos: cartList,
    checkType: "全检品",
    log_id
  });
  await setPrintWmsLog({ return_info: JSON.stringify(result), _id: log_id });
};

// 处理单车的精品线状态
module.exports.handleExcellentByCart = async cart => {
  let { data } = await db.getVCbpcCartlistByCart(cart);
  return await handleExcellentCarts(data);
};

// 同步，凌晨处理前一个工作日大张废超标，
// 修停换异常，丝印实废过多三种场景。
module.exports.sync = async () => {
  // 是否需要记录
  let curHour = parseInt(moment().format("HHMM"), 10);
  // 凌晨2点处理该任务
  console.log(curHour);
  if (curHour > 0959 || curHour < 200) {
    console.log("无需处理精品线记录");
    return;
  }

  // 当天是否已记录
  let { rows } = await db.getPrintMesExcellentProdline();
  if (rows > 0) {
    console.log("无需处理，当天已记录");
    return;
  }

  // 处理兑换票
  await handleChangeCarts();

  // 昨日生产车号列表,确认是否有工序名称(当前精品标志，是否超时生产，需要设置的目标字段)
  let { data } = await db.getVCbpcCartlistYesterday();
  return await handleExcellentCarts(data);
};

const handleExcellentCarts = async cartList => {
  if (cartList.length === 0) {
    return false;
  }
  let logInfo = {
    carts: 0, //车号总数
    allcheck: 0, //转全检
    exchange: 0, //换票超标
    print_time_length: 0, //印刷不畅
    excellent: 0, //精品
    mahou: 0 //转码后
  };

  // 处理7T品
  let prod = "9607T";
  console.log("开始智能精品线处理逻辑");

  // 状态标志位回写为胶印(n-1，当前为2置为1，当前为1置为0)。max(0,n-1)

  // 合并1、2、3的车号列表，统一置为非精品,此处调用接口
  logInfo.carts = cartList.length;

  // 将对应车号置为全检，原因为非精品异常信息
  let allCheckList = R.compose(
    R.map(R.prop("cart_number")),
    R.filter(R.propEq("all_check", "1"))
  )(cartList);

  console.log("置全检车号", allCheckList.length);

  logInfo.print_time_length = allCheckList.length;

  logInfo.allcheck = allCheckList.length;
  // 可能符合条件的精品线车号列表

  // 获取精品生产机台
  let { data: excellentProdLine } = await db.getUdtPsExchange(prod);
  let captainList = R.map(R.prop("erp_code"))(excellentProdLine);

  // console.log('精品线机台', excellentProdLine);

  // 根据erpcode筛选机长
  // 丝印不设置，不打标记，只以总生产时长以及条数来判断丝印转全检规则，此时胶印18，丝印下工序凹一印按18来判断。
  let ExcellentList = R.compose(
    R.filter(item => captainList.includes(item.erp_code)), // 精品机台生产的产品
    R.reject(item => allCheckList.includes(item.cart_number)) // 去除全检车号(置异常)
  )(cartList);

  // 需要置标记的车号
  ExcellentList = R.filter(
    item => item.proc_status - item.proc_status_before == 1
  )(ExcellentList);
  logInfo.excellent = ExcellentList.length;
  // console.log('置标记的车号', ExcellentList);
  console.log("可能符合条件的精品线车号列表", ExcellentList.length);

  // 筛选凹二印
  let mahouCarts = filterCartsByProc("凹二印", ExcellentList);
  logInfo.mahou = mahouCarts.length;
  // 精品置为码后核查工艺;

  // 后续处理
  // 1.转全检
  let result = false;
  if (allCheckList.length) {
    let logInfo = await addPrintWmsLog([
      {
        remark: JSON.stringify(allCheckList),
        rec_time: lib.now()
      }
    ]);

    // 添加日志正常？
    if (logInfo.rows < 1 || logInfo.data[0].affected_rows < 1) {
      console.log("wms记录失败", logInfo);
      return false;
    }

    let log_id = logInfo.data[0].id;
    result = await wms.setProcs({
      carnos: allCheckList,
      checkType: "全检品",
      log_id
    });
    await setPrintWmsLog({ return_info: JSON.stringify(result), _id: log_id });

    let allCheckCartInfo = R.filter(R.propEq("all_check", "1"))(cartList);
    let getPrintLength = cart => {
      let res = R.find(R.propEq("cart_number", cart))(allCheckCartInfo);
      return res.print_length || "";
    };
    await db.addPrintWmsAutoproc(
      allCheckList.map(cart => ({
        cart,
        rec_time: lib.now(),
        remark: `智能精品线转全检品(印刷时长:${getPrintLength(cart)})`
      }))
    );
  }

  // Test_setUdtTbWipinventory 使用测试环境
  // setUdtTbWipinventory 使用线上正式环境

  // 2.转码后
  if (mahouCarts.length) {
    // 置精品
    db.setUdtTbWipinventory(mahouCarts);

    let logInfo = await addPrintWmsLog([
      {
        remark: JSON.stringify(mahouCarts),
        rec_time: lib.now()
      }
    ]);

    // 添加日志正常？
    if (logInfo.rows < 1 || logInfo.data[0].affected_rows < 1) {
      console.log("wms记录失败", logInfo);
      return false;
    }

    result = await wms.setProcs({
      carnos: mahouCarts,
      checkType: "码后核查",
      log_id
    });
    await setPrintWmsLog({ return_info: JSON.stringify(result), _id: log_id });
    await db.addPrintWmsAutoproc(
      mahouCarts.map(cart => ({
        cart,
        rec_time: lib.now(),
        remark: "智能精品线转码后"
      }))
    );
  }

  await db.addPrintWmsAutoproc(
    ExcellentList.map(
      ({ cart_number: cart, print_length, process, captain_name }) => ({
        cart,
        rec_time: lib.now(),
        remark: `智能精品线设定标记(印刷时长:${print_length},工序:${process},机长:${captain_name})`
      })
    )
  );

  ExcellentList = R.pluck("cart_number")(ExcellentList);

  // console.log(ExcellentList);

  // 3.置精品
  if (ExcellentList.length) {
    await db.setUdtTbWipinventory(ExcellentList);
    // console.log(res);
  }

  // console.log(JSON.stringify(logInfo));
  // 4.记录日志
  db.addPrintMesExcellentProdline({
    rec_time: lib.now(),
    remark: JSON.stringify(logInfo)
  });
  console.log("智能精品线处理完毕");
  return true;
};
