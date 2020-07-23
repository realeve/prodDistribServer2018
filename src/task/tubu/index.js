let { axios, mock, _commonData, DEV } = require("../../util/axios");
let lib = require("../../util/lib");
let R = require("ramda");

// 全部品种
const prodList = ["9604T", "9602T"];

const moment = require("moment");

// 2020-03-23 李宾
// 9604T品，印码下机产品全部置为已判废，涂布下机置为未判废，图核完工后置为已判废

const getVCbpcCartlist = (prod) =>
  axios({
    url: "/892/1c5169d5c1.json",
    params: {
      prod: prodList,
    },
  });

const getPrintMesTubuProc = (type) =>
  axios({
    url: "/891/314daf37f1.json",
    params: {
      type,
    },
  });

/**
*   @database: { 质量信息系统 }
*   @desc:     { 批量涂后核查判废状态记录 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@desc:批量插入数据时，约定使用二维数组values参数，格式为[{carts,type }]，数组的每一项表示一条数据*/

const addPrintMesTubuProc = (values) =>
  axios({
    method: "post",
    data: {
      values,
      id: 893,
      nonce: "809ed94180",
    },
  });

/** 数据量较大时建议使用post模式：
*
*   @database: { MES系统_生产环境 }
*   @desc:     { 调整在库产品判废状态 } 
    const { wastestatus, carno } = params;
*/
const setUdtTbWipinventory = (params) =>
  axios({
    method: "post",
    data: {
      ...params,
      id: 894,
      nonce: "d9dc8ac483",
    },
  });

const getCarts = (proc) =>
  R.compose(R.pluck("cart_number"), R.filter(R.propEq("proc_name", proc)));

/**
 * @param NOT_JUDGE 不判废
 * @param WAITING 待判废
 * @param COMPLETE 已判废
 */
const WASTE_STATUS = {
  NOT_JUDGE: 0, //不判废
  WAITING: 1, //待判废
  COMPLETE: 2, //已判废
};

module.exports.init = async () => {
  // 是否需要记录
  let curHour = parseInt(moment().format("HHMM"), 10);
  // 凌晨1点40处理该任务
  // console.log(curHour);
  if (curHour > 1059 || curHour < 140) {
    console.log(curHour, "无需处理判废记录");
    return;
  }

  // TODO 当天已经处理?(此处需要与图核完工品处理逻辑做区分，否则需要单独在10.9.5.133的数据库中做记录，或者在MES中新建表记录涂布的处理状态;)
  let task = {
    code: false,
    tubu: false,
  };

  let res = await getPrintMesTubuProc("印码下机");
  if (res.rows > 0) {
    task.code = true;
  }
  res = await getPrintMesTubuProc("涂布下机");
  if (res.rows > 0) {
    task.tubu = true;
  }
  if (task.code && task.tubu) {
    console.log("当日涂布下机前后产品状态处理完毕");
    return;
  }

  const tstart = moment().subtract(1, "days").format("YYYYMMDD");

  //  TODO 获取印码生产列表、获取涂布生产列表（04T品）
  // TODO 分离涂布以及印码产品(分别处理完工以及未完工)

  let { data, rows } = await getVCbpcCartlist();

  if (rows == 0) {
    await addPrintMesTubuProc([
      { carts: "当日无判废记录", type: "印码下机" },
      { carts: "当日无判废记录", type: "涂布下机" },
    ]);
    return;
  }

  let tubuList = getCarts("涂布")(data);
  let codeList = getCarts("印码")(data);
  // console.log(tubuList, codeList);

  //   WasteStatus 字典说明
  // 0 不
  // 1 待
  // 2 已判废
  if (tubuList.length > 0) {
    // 涂布置为待判废
    let {
      data: [{ affected_rows: mes_id }],
    } = await setUdtTbWipinventory({
      wastestatus: WASTE_STATUS.WAITING,
      carno: tubuList,
    });

    if (mes_id) {
      await addPrintMesTubuProc([
        { carts: tubuList.join(","), type: "涂布下机" },
      ]);
    }
  }

  if (codeList.length > 0) {
    // 记录状态
    let {
      data: [{ affected_rows: mes_id2 }],
    } = await setUdtTbWipinventory({
      wastestatus: WASTE_STATUS.NOT_JUDGE,
      carno: codeList,
    });

    if (mes_id2) {
      await addPrintMesTubuProc([
        { carts: codeList.join(","), type: "印码下机" },
      ]);
    }
  }

  console.log(tstart, "涂布前后车号同步完毕");
};
