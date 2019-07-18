let { axios, mock, _commonData, DEV } = require('../util/axios');
let lib = require('../util/lib');
let R = require('ramda');

const moment = require('moment');

// 更新图像判废状态回写至MES，作为产品是否判废完工的标志

/**
*   @database: { 全幅面 }
*   @desc:     { 指定日期判废完工产品列表 } 
    const { tstart, tend } = params;
*/
const getQfmWipJobs = (params) =>
  DEV
    ? mock(require('@/mock/445_cfb8828229.json'))
    : axios({
        url: '/445/cfb8828229.array',
        params
      });

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 是否需要同步图核完工记录 }
 */
const getPrintMesAutoWasterComplete = () =>
  DEV
    ? mock(require('@/mock/444_6078facd84.json'))
    : axios({
        url: '/444/6078facd84.json'
      });

/**
*   @database: { 质量信息系统 }
*   @desc:     { 记录图核完工产品列表 } 
    const { rec_date, carts, mes_id } = params;
*/
const addPrintMesAutoWasterComplete = (params) =>
  DEV
    ? mock(_commonData)
    : axios({
        method: 'post',
        data: {
          ...params,
          id: 446,
          nonce: 'aa7e9a1779'
        }
      });

/**
*   @database: { MES_MAIN }
*   @desc:     { 记录图像完工产品列表 } 
    const { excutetime, strcarno } = params;
*/
const addUdtDiWasterlog = (params) =>
  DEV
    ? mock(_commonData)
    : axios({
        method: 'post',
        data: {
          ...params,
          id: 447,
          nonce: 'f204c36e17'
        }
      });

module.exports.init = async () => {
  // 是否需要记录
  let curHour = parseInt(moment().format('HHMM'), 10);
  // 凌晨2点处理该任务
  console.log(curHour);
  if (curHour > 1059 || curHour < 200) {
    console.log('无需处理判废记录');
    return;
  }

  // 当天已经处理?
  let res = await getPrintMesAutoWasterComplete();
  if (res.rows > 0) {
    console.log('今日已完成');
    return;
  }

  const tstart = moment()
    .subtract(1, 'days')
    .format('YYYYMMDD');

  let { data, rows } = await getQfmWipJobs({ tstart, tend: tstart });
  let rec_date = lib.now();
  // 当天没有判废记录
  if (rows == 0) {
    await addPrintMesAutoWasterComplete({
      rec_date,
      carts: '当日无判废记录',
      mes_id: 0
    });
    return;
  }

  let strcarno = R.flatten(data).join(',');
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
  console.log(tstart, '判废结果同步完毕');
};
