const lib = require('./lib');
let { axios } = require('./axios');

module.exports.getCartInfoByGZ = async ({ prod, code, kilo }) => {
  // 先查MES车号
  const params = handleGZInfo({ code, prod });
  // console.log(params);
  // http://10.8.1.25:100/api/359/dc3beb8ad3?prod=9607T&start=0000&end=0032&alpha=Q*J&start2=9997&end2=9999&alpha2=Q*I
  let resMes = await getVCbpcCartlist({ ...params, prod, code });
  let cart = '';
  // 如果有数据

  if (resMes.rows > 0) {
    cart = resMes.data[0].CartNumber;
    let resJTZY = await getTbjtProduceDetail({ cart, kilo });
    return lib.concatMesAndJtzy(resJTZY, resMes);
  }
  return await getTbjtProduceDetailByGZ({ ...params, prod, kilo });
  // 如果MES中没有数据，表示为原机台作业系统数据，只查机台作业系统即可
};

/**
*   @database: { 质量信息系统 }
*   @desc:     { 单开仪_更新车号同步状态 } 
    const { cart, note_id } = params;
*/
module.exports.setNoteaysdata = (params) =>
  axios({
    url: '/364/2f106006f5.json',
    params
  });

/**
*   @database: { 质量信息系统 }
*   @desc:     { 单开仪_同步生产信息 } 
     @desc:批量插入数据时，约定使用二维数组values参数，
     格式为[{noteanayid,techtypename,cartnumber,carnumber,gznumber,procname,workclassname,machinename,captainname,teamname,monitorname,printnum,startdate,enddate,productname,cutoperatorname }]，数组的每一项表示一条数据
     */

module.exports.addCartinfodata = (values) =>
  axios({
    method: 'post',
    data: {
      values,
      id: 363,
      nonce: 'c94c80c446'
    }
  });

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 单开分析仪车号同步列表 }
 */
module.exports.getNoteaysdata = () =>
  axios({
    url: '/358/cbe3358deb.json'
  });

/** NodeJS服务端调用：
*
*   @database: { MES_MAIN }
*   @desc:     { 单开仪_冠号查车号 } 
    const { prod, code, kilo } = params;
*/
const getVCbpcCartlist = (params) => {
  let quickSearch = ['9602A', '9603A', '9602T', '9603T'].includes(params.prod);
  if (quickSearch) {
    let code = Number(params.end);
    code = code - (code % 40);
    params.code = code;
  }
  return axios({
    url: quickSearch ? '/360/62b90c9429.json' : '/359/dc3beb8ad3.json',
    params
  });
};

/** NodeJS服务端调用：
*
*   @database: { MES_MAIN }
*   @desc:     { 单开仪_2A3A快速查车号 } 
    const { prod, code, alpha } = params;
*/
// module.exports.getVCbpcCartlist2A = (params) =>
//   axios({
//     url: '/360/62b90c9429.json',
//     params
//   });
/** NodeJS服务端调用：
*
*   @database: { 机台作业 }
*   @desc:     { 单开仪_车号查生产记录 } 
    const { cart, kilo } = params;
*/
const getTbjtProduceDetail = (params) =>
  axios({
    url: '/361/7385a4281a.json',
    params
  });

/** NodeJS服务端调用：
*
*   @database: { 机台作业 }
*   @desc:     { 单开仪_冠号查生产记录 } 
    const { prod, alpha, start, end, alpha2, start2, end2, kilo } = params;
*/
const getTbjtProduceDetailByGZ = (params) =>
  axios({
    url: '/362/f008e16b48.json',
    params
  });

const getLastAlpha = (str) => {
  if (str === 'A') {
    return 'Z';
  }
  let c = str.charCodeAt(0);
  return String.fromCharCode(c - 1);
};

const handleGZInfo = ({ code, prod }) => {
  if (code.length !== 6) {
    return false;
  }
  code = code.toUpperCase();

  let kInfo = 35;
  if (prod.includes('9602') || prod.includes('9603')) {
    kInfo = 40;
  }

  let alphaInfo = code.match(/[A-Z]/g);
  let numInfo = code.match(/\d/g).join('');
  let starNum = code.slice(1, 6).indexOf(alphaInfo[1]) + 1;
  let starInfo = code
    .slice(1, starNum)
    .split('')
    .fill('*')
    .join('');
  let start = parseInt(numInfo, 10) - kInfo;

  let end = numInfo;
  let needConvert = start < 0;
  let start2 = String(start + 1),
    end2 = end;

  let alpha = alphaInfo[0] + starInfo + alphaInfo[1];
  let alpha2 = alpha;

  if (needConvert) {
    start = 10000 + start;
    end = '9999';
    start2 = '0000';
    end2 = numInfo;
    // 字母进位
    let [a1, a2] = alphaInfo;
    if (a2 === 'A') {
      a1 = getLastAlpha(a1);
      a2 = getLastAlpha(a2);
    } else {
      a2 = getLastAlpha(a2);
    }
    alpha = a1 + starInfo + a2;
  }
  start += 1;

  // start = '000' + start;
  // start = start.slice(start.length - 4, start.length);
  const startStr = String(start).padStart(4, '0');

  return {
    start: startStr,
    end,
    start2,
    end2,
    alpha,
    alpha2
  };
};
