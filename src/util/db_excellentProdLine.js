let { axios, DEV, _commonData } = require("./axios");

/** NodeJS服务端调用：
*
*   @database: { MES_MAIN }
*   @desc:     { 精品线_9607T机台质量排名 } 
    const { tstart, tend } = params;
*/
// 469对立体库对外使用，本接口服务端使用
module.exports.getUdtPsExchange = prod =>
  DEV
    ? mock(require("@/mock/469_7e43522457.json"))
    : axios({
        url: "/540/2890c18c9a/60.json",
        params: {
          prod
        }
      });

/**
 *   @database: { 在线清数 }
 *   @desc:     { 精品线_单工序换票数是否大于3张 }
 */
module.exports.getQmRectifyMaster = cart =>
  DEV
    ? mock(require("@/mock/470_4bb557f3b7.json"))
    : axios({
        method: "post",
        data: {
          cart,
          id: 470,
          nonce: "4bb557f3b7"
        }
      });

/**
 *   @database: { MES_MAIN }
 *   @desc:     { 精品线_印刷时长是否超时(修停换) }
 */
module.exports.getVCbpcCartlist = carts =>
  DEV
    ? mock(require("@/mock/471_58f64fbe9a.json"))
    : axios({
        method: "post",
        data: {
          carts,
          id: 471,
          nonce: "58f64fbe9a"
        }
      });

/**
 *   @database: { 小张核查 }
 *   @desc:     { 精品线_丝印机台作废超阈值 }
 */
module.exports.getQaRectifyMaster = cart =>
  DEV
    ? mock(require("@/mock/472_0fbc7c9e8f.json"))
    : axios({
        method: "post",
        data: {
          cart,
          id: 472,
          nonce: "0fbc7c9e8f"
        }
      });

/**
 *   @database: { MES_MAIN }
 *   @desc:     { 精品线_昨日完工车号列表 }
 */
module.exports.getVCbpcCartlistLog = () =>
  DEV
    ? mock(require("@/mock/473_e39c6951e8.json"))
    : axios({
        url: "/473/e39c6951e8.json"
      });

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 精品线_当天是否已处理数据 }
 */
module.exports.getPrintMesExcellentProdline = () =>
  DEV
    ? mock(require("@/mock/474_a2af3bb7c2.json"))
    : axios({
        url: "/474/a2af3bb7c2.json"
      });

/** 
*   @database: { 质量信息系统 }
*   @desc:     { 精品线_记录当天已处理数据 } 
    const { rec_time, remark } = params;
*/
module.exports.addPrintMesExcellentProdline = params =>
  DEV
    ? mock(_commonData)
    : axios({
        url: "/475/c13d7125af.json",
        params
      });

// /** NodeJS服务端调用：
// *
// *   @database: { 质量信息系统 }
// *   @desc:     { 精品线_更新凹背标志 }
//     const { intaglio_back, cart_number } = params;
// */
// module.exports.setPrintMesExcellentProdlineIntagBack = (params) =>
//   DEV
//     ? mock(_commonData)
//     : axios({
//         url: '/476/99752f4c09.json',
//         params
//       });

// /** NodeJS服务端调用：
// *
// *   @database: { 质量信息系统 }
// *   @desc:     { 精品线_更新凹正标志 }
//     const { intaglio_front, cart_number } = params;
// */
// module.exports.setPrintMesExcellentProdlineIntagFront = (params) =>
//   DEV
//     ? mock(_commonData)
//     : axios({
//         url: '/477/fa76698355.json',
//         params
//       });

/**
 *   @database: { 小张核查 }
 *   @desc:     { 精品线_指定日期丝印作废超阈值 }
 */
module.exports.getQaRectifyMasterByDate = tstart =>
  DEV
    ? mock(require("@/mock/478_530f98eb31.json"))
    : axios({
        url: "/478/530f98eb31.json",
        params: {
          tstart
        }
      });

/**
 *   @database: { MES_MAIN }
 *   @desc:     { 精品线_昨日生产产品精品线判定参考数据 }
 */
module.exports.getVCbpcCartlistYesterday = () =>
  DEV
    ? mock(require("../mock/484_cb719ac3ea.json"))
    : axios({
        url: "/484/cb719ac3ea.json"
      }).then(res => {
        // 过滤产量为0的车号，服务端过滤无故很慢。筛选出非全检品的车号，全检品为丝印超阈值
        res.data = res.data.filter(
          item =>
            item.product_num > 0 &&
            ["码后核查", "不分工艺"].includes(item.proc_name)
        );
        return res;
      });

/** NodeJS服务端调用：
*
*   @database: { MES_MAIN }
*   @desc:     { 精品线_测试接口_指定日期精品线判定参考车号列表 } 
    const { tstart, tend } = params;
*/
module.exports.getVCbpcCartlistByDates = params =>
  DEV
    ? mock(require("@/mock/485_9267fe397f.json"))
    : axios({
        url: "/485/9267fe397f.json",
        params
      }).then(res => {
        // 过滤产量为0的车号，服务端过滤无故很慢
        res.data = res.data.filter(
          item =>
            item.product_num > 0 &&
            ["码后核查", "不分工艺"].includes(item.proc_name)
        );
        return res;
      });

/** 数据量较大时建议使用post模式：
 *
 *   @database: { MES系统_生产环境 }
 *   @desc:     { 置精品 }
 */
module.exports.setUdtTbWipinventory = carno =>
  DEV
    ? mock(_commonData)
    : axios({
        method: "post",
        data: {
          carno,
          id: 486,
          nonce: "79fe6a898d"
        }
      });

/**
*   @database: { MES系统_测试环境 }
*   @desc:     { 置精品 } 
    const { isremovebarrier, carno } = params;
*/
module.exports.Test_setUdtTbWipinventory = params =>
  DEV
    ? mock(_commonData)
    : axios({
        url: "/489/729114f286.json",
        params
      });

/**
*   @database: { 质量信息系统 }
*   @desc:     { 批量精品线_转工艺日志记录 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@desc:批量插入数据时，约定使用二维数组values参数，格式为[{cart,rec_time,remark }]，数组的每一项表示一条数据*/
module.exports.addPrintWmsAutoproc = values =>
  DEV
    ? mock(_commonData)
    : axios({
        method: "post",
        data: {
          values,
          id: 490,
          nonce: "c287255727"
        }
      });

/** NodeJS服务端调用：
 *
 *   @database: { MES系统_生产环境 }
 *   @desc:     { MES兑换品自动转全检 }
 */
module.exports.getUdtTbWipinventory = () =>
  axios({
    url: "/607/0c6677a9a2.json"
  });

/** NodeJS服务端调用：
 *
 *   @database: { MES系统_生产环境 }
 *   @desc:     { 指定大万精品情况查询 }
 */
module.exports.getVCbpcCartlistByCart = cart =>
  axios({
    url: "/644/e137b49d49.json",
    params: {
      cart
    }
  });
