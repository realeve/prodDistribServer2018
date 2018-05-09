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


module.exports = {
  setPrintSampleCartlist,
  setPrintWmsProclist
};