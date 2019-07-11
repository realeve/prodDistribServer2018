let { axios, dev } = require('./axios');
/** NodeJS服务端调用：
*
*   @database: { 全幅面 }
*   @desc:     { 指定日期图核完工产品_自动线排产 } 
    const { tstart, tend } = params;
*/
module.exports.getQfmWipJobs = (params) =>
  axios({
    url: '/580/2a2f87d66f.json',
    params
  });

/** NodeJS服务端调用：
 *
 *   @database: { MES系统_生产环境 }
 *   @desc:     { 是否已同步开包量信息 }
 */
module.exports.gettblCbpcBatchOpennum = () =>
  axios({
    url: '/583/3a8dc78b43.json'
  });

/** NodeJS服务端调用：
*
*   @database: { MES系统_生产环境 }
*   @desc:     { 记录精品线开包量 } 
    const { cart, opennum, rec_time } = params;
*/
module.exports.addCbpcBatchOpennum = (params) =>
  axios({
    url: '/584/ca6c993f1a.json',
    params
  });

/** NodeJS服务端调用：
 *
 *   @database: { MES系统_生产环境 }
 *   @desc:     { 白名单中未同步开包量的产品列表 }
 */
module.exports.getVCbpcWhitelist = () =>
  axios({
    url: '/585/8b7cb43d6c.json'
  });

// ----

/**
 *   @database: { MES系统_生产环境 }
 *   @desc:     { 实际开包量统计 }
 */
module.exports.getCbpcBatchOpennumEx = () =>
  axios({
    url: '/602/3b7b66ab32.json'
  });

/** NodeJS服务端调用：
 *
 *   @database: { 全幅面 }
 *   @desc:     { 实际开包量统计 }
 */
module.exports.getOcrContrastResult = (cart) =>
  axios({
    url: '/592/cf000250a0.json',
    params: {
      cart
    }
  });

/** NodeJS服务端调用：
*
*   @database: { MES系统_生产环境 }
*   @desc:     { 更新OCR实废信息 } 
    const { ex_opennum, fake_num, leak_num, ex_opennum_kilo0, fake_num_kilo0, recid } = params;
*/
module.exports.setCbpcBatchOpennum = (params) =>
  axios({
    url: '/603/15af7fe1bb.json',
    params
  });
