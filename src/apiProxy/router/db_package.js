const { axios, dev } = require('../../util/axios');

/** NodeJS服务端调用：
 *
 *   @database: { 库管系统 }
 *   @desc:     { 码后核查在库产品查询 } 
 */
module.exports.getVwWimWhitelist = () => dev ? require('../mock/package_list') : axios({
    url: '/249/f15c70ab61.json'
});