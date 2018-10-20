const { axios } = require('../../util/axios');
const R = require('ramda');
const dev = true;

/** NodeJS服务端调用：
*
*   @database: { 机台作业 }
*   @desc:     { 图像判废每日待判车号列表 } 
    const { tstart, tend } = params;
*/
module.exports.getViewCartfinder = async params =>
  dev
    ? require('../mock/cartlist.json')
    : await axios({
        url: '/185/68f8afe278.json',
        params
      }).then(res => res);

/**
*   @database: { 全幅面 }
*   @desc:     { 图像判废月度产量汇总 } 
    const { tstart, tend } = params;
*/
module.exports.getQfmWipProdLogs = async params =>
  dev
    ? require('../mock/pfnum_month.js')
    : await axios({
        url: '/186/9a8e4c9d74.json',
        params
      }).then(({ data }) =>
        data.map(item => {
          item.cart_nums = parseInt(item.cart_nums, 10);
          item.pf_num = parseInt(item.pf_num, 10);
          return item;
        })
      );

/** NodeJS服务端调用：
*
*   @database: { 全幅面 }
*   @desc:     { 指定车号列表判废条数查询 } 
    const { carts0, carts1 } = params;
*/
module.exports.getWipJobs = async params =>
  dev
    ? require('../mock/pfnum.json')
    : await axios({
        method: 'post',
        data: {
          ...params,
          id: 195,
          nonce: '544a395fd4'
        }
      }).then(({ data }) =>
        data.map(item => {
          item.pf_num = parseInt(item.pf_num, 10);
          item.type = parseInt(item.type, 10);
          return item;
        })
      );
