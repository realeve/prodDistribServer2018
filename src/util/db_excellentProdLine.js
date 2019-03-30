let { axios, DEV, _commonData } = require('./axios');

/** NodeJS服务端调用：
*
*   @database: { MES_MAIN }
*   @desc:     { 精品线_9607T机台质量排名 } 
    const { tstart, tend } = params;
*/
module.exports.getUdtPsExchange = (params) =>
  DEV
    ? mock(require('@/mock/469_7e43522457.json'))
    : axios({
        url: '/469/7e43522457/10.json',
        params
      });

/**
 *   @database: { 在线清数 }
 *   @desc:     { 精品线_单工序换票数是否大于3张 }
 */
module.exports.getQmRectifyMaster = (cart) =>
  DEV
    ? mock(require('@/mock/470_4bb557f3b7.json'))
    : axios({
        method: 'post',
        data: {
          cart,
          id: 470,
          nonce: '4bb557f3b7'
        }
      });

/**
 *   @database: { MES_MAIN }
 *   @desc:     { 精品线_印刷时长是否超时(修停换) }
 */
module.exports.getVCbpcCartlist = (carts) =>
  DEV
    ? mock(require('@/mock/471_58f64fbe9a.json'))
    : axios({
        method: 'post',
        data: {
          carts,
          id: 471,
          nonce: '58f64fbe9a'
        }
      });

/**
 *   @database: { 小张核查 }
 *   @desc:     { 精品线_丝印机台作废超阈值 }
 */
module.exports.getQaRectifyMaster = (cart) =>
  DEV
    ? mock(require('@/mock/472_0fbc7c9e8f.json'))
    : axios({
        method: 'post',
        data: {
          cart,
          id: 472,
          nonce: '0fbc7c9e8f'
        }
      });

/**
 *   @database: { MES_MAIN }
 *   @desc:     { 精品线_昨日完工车号列表 }
 */
module.exports.getVCbpcCartlistLog = () =>
  DEV
    ? mock(require('@/mock/473_e39c6951e8.json'))
    : axios({
        url: '/473/e39c6951e8.json'
      });

/**
*   @database: { 质量信息系统 }
*   @desc:     { 精品线_记录胶印精品产品信息 } 
    const { cart_number, offset_back, offset_front, rec_time } = params;
*/
module.exports.addPrintMesExcellentProdline = (params) =>
  DEV
    ? mock(_commonData)
    : axios({
        url: '/474/a2af3bb7c2.json',
        params
      });

/** NodeJS服务端调用：
*
*   @database: { 质量信息系统 }
*   @desc:     { 精品线_更新丝印标志 } 
    const { silk, cart_number } = params;
*/
module.exports.setPrintMesExcellentProdlineSilk = (params) =>
  DEV
    ? mock(_commonData)
    : axios({
        url: '/475/c13d7125af.json',
        params
      });
/** NodeJS服务端调用：
*
*   @database: { 质量信息系统 }
*   @desc:     { 精品线_更新凹背标志 } 
    const { intaglio_back, cart_number } = params;
*/
module.exports.setPrintMesExcellentProdlineIntagBack = (params) =>
  DEV
    ? mock(_commonData)
    : axios({
        url: '/476/99752f4c09.json',
        params
      });

/** NodeJS服务端调用：
*
*   @database: { 质量信息系统 }
*   @desc:     { 精品线_更新凹正标志 } 
    const { intaglio_front, cart_number } = params;
*/
module.exports.setPrintMesExcellentProdlineIntagFront = (params) =>
  DEV
    ? mock(_commonData)
    : axios({
        url: '/477/fa76698355.json',
        params
      });

/**
 *   @database: { 小张核查 }
 *   @desc:     { 精品线_指定日期丝印作废超阈值 }
 */
module.exports.getQaRectifyMasterByDate = (tstart) =>
  DEV
    ? mock(require('@/mock/478_530f98eb31.json'))
    : axios({
        url: '/478/530f98eb31.json',
        params: {
          tstart
        }
      });
