let { axios } = require('./axios');
const lib = require('./lib');
const R = require('ramda');
/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 丝印后工序产生丝印实废 }
 */
module.exports.getManualverifydata = () =>
  axios({
    url: '/238/835a5d56f2.json'
  });

/** NodeJS服务端调用：
*
*   @database: { 全幅面 }
*   @desc:     { 指定车号丝印作废信息 } 
    const { cart1, cart2 } = params;
*/
module.exports.getQaRectifyMaster = (params) =>
  axios({
    url: '/237/69aa98cd35.json',
    params
  });

/** NodeJS服务端调用：
*
*   @database: { 全幅面 }
*   @desc:     { 判废是否完成 } 
    const { cart1, cart2 } = params;
*/
module.exports.isVerifyComplete = (params) =>
  axios({
    url: '/239/f9b459beb8.json',
    params
  });

/** NodeJS服务端调用：
*
*   @database: { 全幅面 }
*   @desc:     { 开包量统计所需原始数据 } 
    const { cart1, cart2 } = params;
*/
module.exports.getQaRectifyMaster = (params) =>
  axios({
    url: '/240/4ce83034b7.json',
    params
  });

/** NodeJS服务端调用：
 *
 *   @database: { 号码三合一 }
 *   @desc:     { 开包量统计所需号码原始数据 }
 */
module.exports.getWipJobs = (cart) =>
  axios({
    url: '/241/773bffb950.json',
    params: {
      cart
    }
  });

/**
*   @database: { 质量信息系统 }
*   @desc:     { 更新开包量及丝印数据分析结果 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@id:_id. 参数说明：api 索引序号
    const { fake_after_siyin, fake_not_in_mahou, ex_opennum, ex_siyin_opennum, ex_code_opennum, _id } = params;
*/
module.exports.setManualverifydata = (params) =>
  axios({
    url: '/242/d4c0e74a28.json',
    params
  });

/** NodeJS服务端调用：
 *
 *   @database: { 机台作业 }
 *   @desc:     { 指定车号列表中全检品 }
 */
// module.exports.getViewCartfinder = async (carts) => {
//   let res1 = await axios({
//     method: 'post',
//     data: {
//       carts,
//       id: 210,
//       nonce: 'bb0c2704f1'
//     }
//   });
//   res2 = await getVCbpcCartlistAllCheck(carts);
//   return lib.concatMesAndJtzy(res1, res2);
// };
module.exports.getViewCartfinder = getVCbpcCartlistAllCheck
/**
 *   @database: { MES_MAIN }
 *   @desc:     { 指定车号列表中全检品 }
 */
const getVCbpcCartlistAllCheck = (carts) =>
  axios({
    url: '/343/16231d052e.json',
    params: {
      carts
    }
  });

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 批量更新不需要处理的任务 }
 */
module.exports.setManualverifydataAllcheck = (carts) =>
  carts.length > 0 && !R.isNil(carts[0])
    ? axios({
        method: 'post',
        data: {
          carts,
          id: 244,
          nonce: 'd68e782730'
        }
      })
    : false;

/** NodeJS服务端调用：
 *
 *   @database: { 机台作业 }
 *   @desc:     { 指定车号中已完成抽查的产品 }
 */
module.exports.getViewCartfinderFinshed = async (carts) => {
  let res1 = await axios({
    url: '/247/0e7fc2bfec.json',
    params: {
      carts
    }
  });
  let res2 = await getVCbpcCartlist(carts);
  return lib.concatMesAndJtzy(res1, res2);
};

/**
 *   @database: { MES_MAIN }
 *   @desc:     { 指定车号中已完成抽查的产品 }
 */
const getVCbpcCartlist = (carts) =>
  axios({
    url: '/342/8aa04d0a03.json',
    params: {
      carts
    }
  });
