let { axios } = require("../../util/axios");


/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 人工抽检领活 } 
 */
const setPrintSampleCartlist = async cart_number => await axios({
  url: '/56/fe353b42f0.json',
  params: {
    cart_number
  },
}).then(res => res);

/**
*   @database: { 质量信息系统 }
*   @desc:     { 下机产品通知已完成状态以及工序 } 
    const { process, status, cart } = params;
*/
const setPrintWmsProclist = async params => await axios({
  url: '/115/296ec53c58.json',
  params,
}).then(res => res);


/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 当前车号是否有连续废通知 } 
 */
const getPrintMachinecheckMultiweak = async cart => await axios({
  url: '/116/c96d2b8975.json',
  params: {
    cart
  },
}).then(res => res);

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 领用车号后更新抽检机台信息 } 
 */
const setPrintSampleMachine = async cart => await axios({
  url: '/117/3b263894ae.json',
  params: {
    cart
  },
}).then(res => res);

/**
*   @database: { 质量信息系统 }
*   @desc:     { 更新异常品完工状态 } 
    const { status, process, prod_date, cart } = params;
*/
const setPrintAbnormalProd = async params => await axios({
  url: '/118/5877893b72.json',
  params,
}).then(res => res);
/**
*   @database: { 质量信息系统 }
*   @desc:     { 机台生产异常信息完工状态跟踪 } 
    const { status, process, prod_date, cart } = params;
*/
const setPrintMachinecheckMultiweak = async params => await axios({
  url: '/119/fc4fd73e9e.json',
  params,
}).then(res => res);
module.exports = {
  setPrintSampleCartlist,
  setPrintWmsProclist,
  getPrintMachinecheckMultiweak,
  setPrintSampleMachine,
  setPrintAbnormalProd,
  setPrintMachinecheckMultiweak
};