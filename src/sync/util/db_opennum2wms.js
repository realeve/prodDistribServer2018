let { axios } = require('./axios');

/** NodeJS服务端调用：
 *
 *   @database: { 库管系统 }
 *   @desc:     { 在库产品开包量信息未同步车号列表 }
 */
module.exports.getVwWimWhitelist = () =>
  axios({
    url: '/261/abf3f3f01d.json'
  });
