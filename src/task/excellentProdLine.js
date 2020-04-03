let R = require("ramda");
let db = require("../util/db_excellentProdLine");
let lib = require("../util/lib");
let moment = require("moment");
let wms = require("../util/wms");
let { addPrintWmsLog, setPrintWmsLog } = require("../util/db");

// 部署到线上必备关闭
const DEBUG_MODE = false;

// 2020年起，全检量较少，全部关闭
const CLOSE_ALLCHECK = true;

const filterCartsByProc = (proc, carts) =>
  R.compose(
    R.map(R.prop("cart_number")),
    R.filter(R.propEq("process", proc))
  )(carts);

// 兑换品自动转全检
const handleChangeCarts = async () => {
  let { rows } = await db.getPrintWmsLogExchange();
  if (rows > 0) {
    return;
  }
  let { data } = await db.getUdtTbWipinventory();
  handleCarts(data, "兑换品自动转全检");
};

const handleIntaglioProd = async () => {
  let { rows } = await db.getPrintWmsLog();

  if (rows > 0) {
    return;
  }

  let { data } = await db.getVCbpcCartlist6T();
  handleCarts(data, "6T凹印转全检");
};

const handleCarts = async (data, remark) => {
  if (data.length === 0) {
    return false;
  }
  // 如果当前有兑换品，自动转全检
  let cartList = R.pluck(["cart"], data); // 获取车号列表
  let logInfo = await addPrintWmsLog([
    {
      remark: remark + JSON.stringify(cartList),
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
    if (!DEBUG_MODE) {
      return;
    }
  }

  // 当天是否已记录
  let { rows } = await db.getPrintMesExcellentProdline();
  if (rows > 0) {
    console.log("无需处理，当天已记录");
    if (!DEBUG_MODE) {
      return;
    }
  }

  // 处理兑换票自动转全检
  await handleChangeCarts();

  // 6T品自动转全检
  await handleIntaglioProd();

  // 昨日生产车号列表,确认是否有工序名称(当前精品标志，是否超时生产，需要设置的目标字段)
  let { data } = await db.getVCbpcCartlistYesterday();
  await handleExcellentCarts(data);
  return handleIntaglioCompleteCarts();

  /* 2019-11 调整转换逻辑如下:
 
  1.读取凹二印完成品车号列表A；
  2.列表A中任意工序生产超时则转全检；
  3.列表A中丝印质量有问题转全检,好品转码后；
  4.精品线无问题的产品转码后，其余不处理.
  
  干胶印:18
  丝凸印丝印:19
  凹一印:13
  凹二印:22
  
  */
};

const getProcLog = async data => {
  let logInfo = await addPrintWmsLog([
    {
      remark: JSON.stringify(data),
      rec_time: lib.now()
    }
  ]);

  // 日志添加成功，处理转全检逻辑
  if (logInfo.rows == 0 || logInfo.data[0].affected_rows < 1) {
    return 0;
  }
  return logInfo.data[0].id;
};

// 处理凹二印完成品状态
const handleIntaglioCompleteCarts = async () => {
  // 1.读取凹二印完成品车号列表A；
  let { data } = await db.getVCbpcCartlistTasks();
  let cartList = R.pluck("cart", data);
  if (cartList.length === 0) {
    return;
  }
  let result = false;

  // 2.列表A中丝印质量有问题转全检,好品转码后；
  let { data: allcheck2 } = await db.getAllcheckOrMahou(cartList);

  if (allcheck2.length) {
    let mahou = R.filter(item => item.proc == 0)(allcheck2);
    let mahoulist = R.pluck("cart", mahou);
    if (mahoulist.length) {
      // 丝印正常品转码后

      let log_id = await getProcLog({
        data: mahoulist,
        proc: "精品线丝印转码后"
      });
      // 添加日志正常？
      if (log_id) {
        result = await wms.setProcs({
          carnos: mahoulist,
          checkType: "码后核查",
          log_id
        });

        await setPrintWmsLog({
          return_info: JSON.stringify(result),
          _id: log_id
        });
        await db.addPrintWmsAutoproc(
          mahoulist.map(cart => ({
            cart,
            rec_time: lib.now(),
            remark: "丝印品转码后"
          }))
        );
      }
    }

    // 转全检
    if (!CLOSE_ALLCHECK) {
      let allcheck3 = R.filter(item => item.proc == 1)(allcheck2);
      let allchecklist3 = R.pluck("cart", allcheck3);
      if (allchecklist3.length) {
        // 丝印正常品转码后

        let log_id = await getProcLog({
          data: allchecklist3,
          proc: "精品线丝印转全检"
        });
        // 添加日志正常？
        if (log_id) {
          result = await wms.setProcs({
            carnos: allchecklist3,
            checkType: "码后核查",
            log_id
          });

          await setPrintWmsLog({
            return_info: JSON.stringify(result),
            _id: log_id
          });
          await db.addPrintWmsAutoproc(
            allchecklist3.map(cart => ({
              cart,
              rec_time: lib.now(),
              remark: "丝印品转码后"
            }))
          );
        }
      }
    }
  }

  if (!CLOSE_ALLCHECK) {
    // 3.列表A中任意工序生产超时则转全检；
    let { data: allcheck1 } = await db.getVCbpcCartlistAllcheck();
    if (allcheck1.length) {
      let log_id = await getProcLog(allcheck1);

      // 日志添加成功，处理转全检逻辑
      if (log_id > 0) {
        let allcheckList1 = R.pluck("cart_number", allcheck1);
        result = await wms.setProcs({
          carnos: allcheckList1,
          checkType: "全检品",
          log_id
        });
        await setPrintWmsLog({
          return_info: JSON.stringify(result),
          _id: log_id
        });
      }
    }
  }

  return true;
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
  // 1.转全检不做处理，处理凹二印产品
  let result = false;
  // if (allCheckList.length) {
  //   let logInfo = await addPrintWmsLog([
  //     {
  //       remark: JSON.stringify(allCheckList),
  //       rec_time: lib.now()
  //     }
  //   ]);

  //   // 添加日志正常？
  //   if (logInfo.rows < 1 || logInfo.data[0].affected_rows < 1) {
  //     console.log("wms记录失败", logInfo);
  //     return false;
  //   }

  //   let log_id = logInfo.data[0].id;
  //   result = await wms.setProcs({
  //     carnos: allCheckList,
  //     checkType: "全检品",
  //     log_id
  //   });
  //   await setPrintWmsLog({ return_info: JSON.stringify(result), _id: log_id });

  //   let allCheckCartInfo = R.filter(R.propEq("all_check", "1"))(cartList);
  //   let getPrintLength = cart => {
  //     let res = R.find(R.propEq("cart_number", cart))(allCheckCartInfo);
  //     return res.print_length || "";
  //   };
  //   await db.addPrintWmsAutoproc(
  //     allCheckList.map(cart => ({
  //       cart,
  //       rec_time: lib.now(),
  //       remark: `智能精品线转全检品(印刷时长:${getPrintLength(cart)})`
  //     }))
  //   );
  // }

  // Test_setUdtTbWipinventory 使用测试环境
  // setUdtTbWipinventory 使用线上正式环境

  // 2.凹二印产品转码后，不影响MES出库
  if (mahouCarts.length) {
    // 置精品
    db.setUdtTbWipinventory(mahouCarts);

    let log_id = await getProcLog({
      data: mahouCarts,
      proc: "凹二印精品产品转码后"
    });
    // 添加日志正常？
    if (log_id === 0) {
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
