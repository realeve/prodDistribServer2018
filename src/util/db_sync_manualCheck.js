let { axios, dev } = require('./axios');

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 图像判废同步任务列表 }
 */
module.exports.getMahoudata = async () =>
  dev
    ? require('../sync/mock/synclist.json')
    : await axios({
        url: '/199/7b801561d1.json'
      }).then((res) => res);

/** NodeJS服务端调用：
 *
 *   @database: { 全幅面 }
 *   @desc:     { 码后核查判废结果统计 }
 */
module.exports.getQfmQaTempQatbl = async (cart) =>
  dev
    ? require('../sync/mock/verifycount.json')
    : await axios({
        url: '/203/ba81d18297.json',
        params: {
          cart
        }
      }).then((res) => res);

/** NodeJS服务端调用：
 *
 *   @database: { 号码三合一 }
 *   @desc:     { 号码开包量 }
 */
module.exports.getWipJobs = async (cart) =>
  dev
    ? require('../sync/mock/codeopennum.json')
    : await axios({
        url: '/202/5cdb3b665a.json',
        params: {
          cart
        }
      }).then((res) => res);

/** NodeJS服务端调用：
 *
 *   @database: { 全幅面 }
 *   @desc:     { 指定车号丝印开包量 }
 */
module.exports.getQaTempQatbl = async (cart) =>
  dev
    ? require('../sync/mock/siyinopennum.json')
    : await axios({
        url: '/200/85aa673170.json',
        params: {
          cart
        }
      }).then((res) => res);

/** NodeJS服务端调用：
*
*   @database: { 质量信息系统 }
*   @desc:     { 插入图像判废同步结果 } 
    const { cartnumber, producttypename, producetime, verifytime, verifyoperatorname, totalcount, vbigpiececount, kaicount, vkaicount, vrealtotalcount, opennum, opennum_code, realfake_code, opennum_siyin, realfake_siyin } = params;
*/
module.exports.addManualverifydata = async (params) =>
  await axios({
    url: '/204/83cf2b1b83.json',
    params
  }).then((res) => res);

/**
*   @database: { 质量信息系统 }
*   @desc:     { 人工判废状态回写 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@id:_id. 参数说明：api 索引序号
    const { bmanualsync, _id } = params;
*/
module.exports.setMahoudata = async (params) =>
  await axios({
    url: '/205/18449cf95f.json',
    params
  }).then((res) => res);

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 今年未更新的车号列表 }
 */
module.exports.getManualverifydata = async () =>
  await axios({
    url: '/206/7eb0409772.json'
  }).then((res) => res);

/** NodeJS服务端调用：
*
*   @database: { 质量信息系统 }
*   @desc:     { 更新2018年丝印开包量信息 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@id:_id. 参数说明：api 索引序号
    const { producttypename, producetime, verifytime, verifyoperatorname, totalcount, vbigpiececount, vkaicount, vrealtotalcount, opennum, opennum_code, realfake_code, opennum_siyin, realfake_siyin, _id } = params;
*/
module.exports.setManualverifydata = async (params) =>
  await axios({
    url: '/207/23e7277115.json',
    params
  }).then((res) => res);
