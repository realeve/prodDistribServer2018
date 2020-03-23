let { axios, mock, _commonData, DEV } = require("../../util/axios");
let lib = require("../../util/lib");
let R = require("ramda");

const prodList = ["9604T"];

const moment = require("moment");

// 2020-03-23 李宾
// 9604T品，印码下机产品全部置为已判废，涂布下机置为未判废，图核完工后置为已判废

const getQfmWipJobs = params =>
  axios({
    url: "/445/cfb8828229.array",
    params
  });

const getPrintMesAutoWasterComplete = () =>
  axios({
    url: "/444/6078facd84.json"
  });

const addPrintMesAutoWasterComplete = params =>
  axios({
    method: "post",
    data: {
      ...params,
      id: 446,
      nonce: "aa7e9a1779"
    }
  });

const addUdtDiWasterlog = params =>
  axios({
    method: "post",
    data: {
      ...params,
      id: 447,
      nonce: "f204c36e17"
    }
  });

module.exports.init = async () => {
  // 是否需要记录
  let curHour = parseInt(moment().format("HHMM"), 10);
  // 凌晨1点40处理该任务
  console.log(curHour);
  if (curHour > 1059 || curHour < 140) {
    console.log("无需处理判废记录");
    return;
  }

  // TODO 当天已经处理?(此处需要与图核完工品处理逻辑做区分，否则需要单独在10.9.5.133的数据库中做记录，或者在MES中新建表记录涂布的处理状态;)

  let res = await getPrintMesAutoWasterComplete();
  if (res.rows > 0) {
    console.log("今日已完成");
    return;
  }

  const tstart = moment()
    .subtract(1, "days")
    .format("YYYYMMDD");

  //  TODO 获取印码生产列表、获取涂布生产列表（04T品）
  // TODO 分离涂布以及印码产品(分别处理完工以及未完工)

  let { data, rows } = await getQfmWipJobs({ tstart, tend: tstart });
  let rec_date = lib.now();
  // 当天没有判废记录
  if (rows == 0) {
    await addPrintMesAutoWasterComplete({
      rec_date,
      carts: "当日无判废记录",
      mes_id: 0
    });
    return;
  }

  let strcarno = R.flatten(data).join(",");
  let excutetime = rec_date;

  // 记录状态
  let {
    data: [{ id: mes_id }]
  } = await addUdtDiWasterlog({ excutetime, strcarno });
  if (mes_id) {
    await addPrintMesAutoWasterComplete({
      rec_date,
      carts: strcarno,
      mes_id
    });
  }
  console.log(tstart, "判废结果同步完毕");
};
