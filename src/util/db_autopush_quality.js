let { axios } = require('./axios');
// const lib = require('./lib');

module.exports.getVCbpcCartlist = (params) =>
  DEV
    ? mock(require('@/mock/387_57bd15d543.json'))
    : axios({
        url: '/387/57bd15d543.json',
        params
      });
/** NodeJS服务端调用：
*
*   @database: { 胶凹大张离线检测系统 }
*   @desc:     { 质量推送_过程质量控制水平 } 
    const { tstart, tend } = params;
*/
module.exports.getViewScoreIntaglio = (params) =>
  DEV
    ? mock(require('@/mock/388_086dfce060.json'))
    : axios({
        url: '/388/086dfce060.json',
        params
      });
/** NodeJS服务端调用：
*
*   @database: { 质量信息系统 }
*   @desc:     { 质量推送_图核判废开包量 } 
    const { tstart, tend } = params;
*/
module.exports.getManualverifydata = (params) =>
  DEV
    ? mock(require('@/mock/389_1d6f9c327a.json'))
    : axios({
        url: '/389/1d6f9c327a.json',
        params
      });

/** NodeJS服务端调用：
*
*   @database: { 质量信息系统 }
*   @desc:     { 质量推送_OCR开包量 } 
    const { tstart, tend } = params;
*/
module.exports.getOcrdata = (params) =>
  DEV
    ? mock(require('@/mock/390_bf3420d67f.json'))
    : axios({
        url: '/390/bf3420d67f.json',
        params
      });

/** NodeJS服务端调用：
*
*   @database: { 质量信息系统 }
*   @desc:     { 质量推送_各机台机检平均好品率 } 
    const { tstart, tend } = params;
*/
module.exports.getViewPrintHecha = (params) =>
  DEV
    ? mock(require('@/mock/391_c998a5a4bc.json'))
    : axios({
        url: '/391/c998a5a4bc.json',
        params
      });
/**
*   @database: { 质量信息系统 }
*   @desc:     { 质量推送_品种平均好品率 } 
    const { tstart, tend } = params;
*/
export const getViewPrintHecha = (params) =>
  DEV
    ? mock(require('@/mock/392_3383c9a3c8.json'))
    : axios({
        url: '/392/3383c9a3c8.json',
        params
      });

/** NodeJS服务端调用：
*
*   @database: { 质量信息系统 }
*   @desc:     { 质量推送_好品率 } 
    const { tstart, tend } = params;
*/
module.exports.getViewPrintHecha = (params) =>
  DEV
    ? mock(require('@/mock/393_cbda0f9cac.json'))
    : axios({
        url: '/393/cbda0f9cac.json',
        params
      });

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 平均未检最多的机台 }
 */
module.exports.getMahoudata = () =>
  DEV
    ? mock(require('@/mock/394_83c1b68b63.json'))
    : axios({
        url: '/394/83c1b68b63.json'
      });

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 质量推送_钞纸封包率 }
 */
module.exports.getViewPaperValidate = () =>
  DEV
    ? mock(require('@/mock/395_adc3db65a7.json'))
    : axios({
        url: '/395/adc3db65a7.json'
      });

/** NodeJS服务端调用：
*
*   @database: { 质量信息系统 }
*   @desc:     { 质量推送_钞纸过程质量控制水平 } 
    const { tstart, tend, tstart2, tend2, tstart3, tend3 } = params;
*/
module.exports.getViewPaperParaAbnormal = (params) =>
  DEV
    ? mock(require('@/mock/396_c11cc0b430.json'))
    : axios({
        url: '/396/c11cc0b430.json',
        params
      });

/**
*   @database: { 质量信息系统 }
*   @desc:     { 质量推送_钞纸机检好品率 } 
    const { tstart, tend } = params;
*/
export const getViewPaperQuality = (params) =>
  DEV
    ? mock(require('@/mock/397_03b33c423a.json'))
    : axios({
        url: '/397/03b33c423a.json',
        params
      });
