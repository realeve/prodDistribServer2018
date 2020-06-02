let { axios } = require("../../util/axios");

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 人工抽检领活 }
 */
const setPrintSampleCartlist = async (cart_number) =>
  await axios({
    url: "/56/fe353b42f0.json",
    params: {
      cart_number,
    },
  });

/**
*   @database: { 质量信息系统 }
*   @desc:     { 下机产品通知已完成状态以及工序 } 
    const { process, status, cart } = params;
*/
const setPrintWmsProclist = async (params) =>
  await axios({
    url: "/115/296ec53c58.json",
    params,
  });

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 当前车号是否有连续废通知 }
 */
const getPrintMachinecheckMultiweak = async (cart) =>
  await axios({
    url: "/116/c96d2b8975.json",
    params: {
      cart,
    },
  });

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 领用车号后更新抽检机台信息 }
 */
const setPrintSampleMachine = async (cart) =>
  await axios({
    url: "/117/3b263894ae.json",
    params: {
      cart,
    },
  });

/**
*   @database: { 质量信息系统 }
*   @desc:     { 更新异常品完工状态 } 
    const { status, process, prod_date, cart } = params;
*/
const setPrintAbnormalProd = async (params) =>
  await axios({
    url: "/118/5877893b72.json",
    params,
  });
/**
*   @database: { 质量信息系统 }
*   @desc:     { 机台生产异常信息完工状态跟踪 } 
    const { status, process, prod_date, cart } = params;
*/
const setPrintMachinecheckMultiweak = async (params) =>
  await axios({
    url: "/119/fc4fd73e9e.json",
    params,
  });

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 更新四新及异常品人工抽检产品领用状态 }
 */
const setPrintWmsProclistStatus = async (cart) =>
  await axios({
    url: "/122/9343c77d3b.json",
    params: {
      cart,
    },
  });

/**
*   @database: { 质量信息系统 }
*   @desc:     { 产品锁车原因 } 
    const { cart1, cart2, cart3 } = params;
*/
const getPrintWmsProclist = async (params) =>
  await axios({
    url: "/134/dc12ffbbae.json",
    params,
  });

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 更新车号列表领用状态 }
 */
const setPrintCutProdLog = (carts) =>
  axios({
    url: "/276/84a244aae0.json",
    params: {
      carts,
    },
  });
/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 中班排产前将未完成产品置为取消领用 }
 */
const setPrintCutProdLogCancel = (carts) =>
  axios({
    url: "/278/6c31ebce6b.json",
    params: {
      carts,
    },
  });

module.exports = {
  setPrintSampleCartlist,
  setPrintWmsProclist,
  setPrintWmsProclistStatus,
  getPrintMachinecheckMultiweak,
  setPrintSampleMachine,
  setPrintAbnormalProd,
  setPrintMachinecheckMultiweak,
  getPrintWmsProclist,
  setPrintCutProdLog,
  setPrintCutProdLogCancel,
};
