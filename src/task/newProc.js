let db = require("../util/db");
let R = require("ramda");
let wms = require("../util/wms");
let lib = require("../util/lib");
// const consola = require("consola");
const procHandler = require("../util/procHandler");

let stepIdx = 1;

let check_type = "四新验证";
let reason_code = "q_newProc";

/**
 * @desc:四新验证，初始化。
 * 按数据库的CRUD，具体流程如下：
 * 1.心跳记录，进入该流程；
 * 2.获取待处理的获取四新任务列表;
 * 3.依次对以上列表中的任务处理。
 */
const init = async () => {
  let task_name = "四新任务处理";
  console.log("待加入对已处理车号的过滤");

  await procHandler.recordHeartbeat(task_name);

  console.info(`step${stepIdx++}: 获取四新任务列表`);
  let data = await db.getPrintNewprocPlan();

  if (data.rows === 0) {
    console.info(`step${stepIdx++}: 四新任务列表为空，下个循环继续。`);
    return;
  }

  console.log("读取到以下任务列表:" + JSON.stringify(data.data));

  console.log(`step${stepIdx++}: 共获取到${data.rows}条任务`);

  // 调试模式只处理一项信息
  // await handlePlanList(data.data[0]);
  // return;

  data.data.forEach(async (item, idx) => {
    console.info(`       开始处理任务${idx + 1}/${data.rows}:`);
    await handlePlanList(item);
  });
};

// 根据预置的信息拼凑验证名称；
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

/**
 * @desc:处理计划任务列表
 * 按数据库的CRUD，具体流程如下：
 * 1.根据时间段类型，读取对应的车号列表（按冠字，按时间段，从某天开始）
 * 2.读取已经处理完毕的车号列表，同时仅处理未记录的车号信息;
 * 说明：
 * a.由于任务会以5-10分钟定时触发，在第1步读出的车号列表中需要做筛选，避免重复设置工艺/重新记录产品实际工艺信息。
 * 这样可保证每次提交到后台（立体库/日志库）中的信息均是未处理过的车号。
 * b.对于第1次设置工艺A，第二次设置工艺B的情况，通过新建任务来分别处理。
 *
 * 3.按车号列表批量设置产品工艺流程至立体库；
 * 4.更新任务完成状态，在此过程中按立体库返回的实际车号列表信息做状态变更处理。
 */
let handlePlanList = async data => {
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
    alpha_num,
    ProductName
  } = data;

  let taskName = getLockReason(data);
  console.info("开始任务信息：" + taskName);
  num1 = parseInt(num1, 10);
  num2 = parseInt(num2, 10);

  let today = lib.ymd();
  if (today < rec_date1) {
    console.error(`exit:任务${rec_date1}尚未开始`);
    return;
  }

  let cartList1 = [],
    cartList2 = [],
    cartList = [];

  switch (parseInt(date_type, 10)) {
    case 1:
      // IS_DATE_RANGE
      cartList = await db.getCartListWithDate({
        machine_name,
        rec_date1,
        rec_date2
      });
      cartList1 = cartList.data;
      break;
    case 2:
      // IS_GZ_CHECK
      let start = '000' + num1;
      let end = '000' + num2;

      cartList = await db.getCartListWithGZ({
        prod_name: ProductName,
        gz: alpha_num,
        start_no: start.slice(start.length - 4),
        end_no: end.slice(end.length - 4)
      });
      cartList1 = R.map(R.nth(0))(cartList.data);
      break;
    case 0:
    default:
      let maxCarts = num1 + num2;
      cartList = await db.getCartList({
        machine_name,
        rec_date: rec_date1,
        max_carts: maxCarts
      });

      if (cartList.rows <= num1) {
        cartList1 = cartList.data;
      } else {
        cartList1 = cartList.data.slice(0, num1);
        cartList2 = cartList.data.slice(num1, num2 + num1);
      }
      break;
  }
  // 数组平铺
  cartList1 = R.compose(R.uniq, R.flatten)(cartList1);
  cartList2 = R.compose(R.uniq, R.flatten)(cartList2);

  // console.log(cartList1);
  // console.log(cartList2);
  // return;

  // 已经插入的车号列表
  let handledCartInfo = await db.getPrintWmsProclist({
    check_type,
    task_id: id
  });
  let handledCarts = R.map(R.prop("cart_number"))(handledCartInfo.data);
  console.log("已处理的车号列表");
  console.log(handledCarts);

  // R.difference(),求差集。求第一个列表中，未包含在第二个列表中的任一元素的集合。对象和数组比较数值相等，而非引用相等。
  cartList1 = R.difference(cartList1, handledCarts);
  cartList2 = R.difference(cartList2, handledCarts);

  // console.log('查看待处理车号列表：')
  // console.log(cartList1);
  // console.log(cartList2);
  // return;

  // 立体库处理结果
  let wmsRes;
  if (cartList1.length) {
    // 立体库接口批量设置产品信息
    wmsRes = await procHandler.handleProcStream({
      carnos: cartList1,
      proc_stream: proc_stream1,
      check_type,
      reason_code,
      task_id: id
    });

    // 处理成功的列表
    cartList1 = wmsRes.status ? wmsRes.result.handledList : [];
  }

  if (cartList2.length) {
    // 立体库接口批量设置产品信息
    wmsRes = await procHandler.handleProcStream({
      carnos: cartList2,
      proc_stream: proc_stream2,
      check_type,
      reason_code,
      task_id: id
    });

    // 处理成功的列表
    cartList2 = wmsRes.status ? wmsRes.result.handledList : [];
  }

  // handledCart大万数达到条件
  if (cartList1.length + cartList2.length == 0) {
    await handleFinishStatus({ data, cartList: handledCarts, taskName });
  } else {
    await handleFinishStatus({ data, cartList: [...cartList1, ...cartList2], taskName });
  }


  // 设置完成进度
  // 此处仅记录在两次立体库信息入库中，处理成功的车号列表信息，如果入库数量满足预先设置的工艺流程中记录的信息，则将任务完成状态置为已完成。

};

/**
 * @desc:更新任务完成状态
 * 三种情况按以下规则确定是否已经处理完毕：
 * 1.按冠字：冠字段的车号数是否等于实时处理完毕的车号数;
 * 2.按时间段：当天时间是否大于结束时间；
 * 3.按某天起大万数：已处理的大数万是否等于实时大万数；
 */
let handleFinishStatus = async ({ data, cartList, taskName }) => {

  // 数据预处理
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
    IS_CARTS_COUNT && cartList.length >= num2 + num1;

  // 某段时间的所有产品：当前日期信息大于结束时间时
  const TIME_RELEASED = IS_DATE_RANGE && today > rec_date2;

  const IS_ALL_GZ_FINISHED =
    IS_GZ_CHECK && isGZFinish({ ProductName, num1, num2, cartList });

  let complete_num = cartList.length;
  let complete_status = 0;
  let update_time = lib.now();


  // 以上条件同时满足时，任务完成
  if (TIME_RELEASED || CARTS_FINISHED || IS_ALL_GZ_FINISHED) {
    complete_status = 1;
    console.log(`exit:任务${taskName}已经结束，此处更新任务状态`);
  }

  // 更新数据库状态及实时处理进度
  await db.setPrintNewprocPlan({
    complete_num,
    complete_status,
    update_time,
    _id: id
  });
  console.info(`当前任务完成车号${complete_num}万,任务状态${complete_status}`);
};

module.exports = { init };