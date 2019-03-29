let { axios, DEV, _commonData } = require('./axios');

/**
*   @database: { MES_MAIN }
*   @desc:     { 批量记录装箱入库数据 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@desc:批量插入数据时，约定使用二维数组values参数，格式为[{product,gz gz,boxid_start,boxid_end,boxgz,xwdh xwdh,mxzs mxzs,rq rq,scline,kgcodeun,hw hw, rec_time }]，数组的每一项表示一条数据*/
module.exports.addUdtTbEwminstorage = (values) =>
  DEV
    ? mock(_commonData)
    : axios({
        method: 'post',
        data: {
          values,
          id: 462,
          nonce: 'f297e52768'
        }
      });

/**
*   @database: { MES_MAIN }
*   @desc:     { 批量记录装箱出库数据 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@desc:批量插入数据时，约定使用二维数组values参数，格式为[{product,gz gz,boxid_start,boxid_end,boxgz,xwdh xwdh,mxzs mxzs,rq rq,scline,kgcodeun,hw hw, rec_time }]，数组的每一项表示一条数据*/
module.exports.addUdtTbEwmoutstorage = (values) =>
  DEV
    ? mock(_commonData)
    : axios({
        method: 'post',
        data: {
          values,
          id: 463,
          nonce: '24f104813a'
        }
      });

/**
*   @database: { MES_MAIN }
*   @desc:     { 批量记录装箱当前库存 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@desc:批量插入数据时，约定使用二维数组values参数，格式为[{product,gz gz,boxid_start,boxid_end,boxgz,xwdh xwdh,mxzs mxzs,rq rq,hw hw, rec_time }]，数组的每一项表示一条数据*/
module.exports.addUdtTbEwmstorageinfo = (values) =>
  DEV
    ? mock(_commonData)
    : axios({
        method: 'post',
        data: {
          values,
          id: 464,
          nonce: 'e6e57257b3'
        }
      });
/**
*   @database: { 二维码系统 }
*   @desc:     { 成品库入库操作 } 
    const { tstart, tend } = params;
*/
module.exports.getVCpkIn = (params) =>
  DEV
    ? mock(require('@/mock/459_928c4da250.json'))
    : axios({
        url: '/459/928c4da250.json',
        params
      });

/**
*   @database: { 二维码系统 }
*   @desc:     { 成品库出库操作 } 
    const { tstart, tend } = params;
*/
module.exports.getVCpkOut = (params) =>
  DEV
    ? mock(require('@/mock/460_da7906012f.json'))
    : axios({
        url: '/460/da7906012f.json',
        params
      });

/**
 *   @database: { 二维码系统 }
 *   @desc:     { 周转库、成品库在库情况 }
 */
module.exports.getVCpk = () =>
  DEV
    ? mock(require('@/mock/461_559fbdddf6.json'))
    : axios({
        url: '/461/559fbdddf6.json'
      });

/**
 *   @database: { MES_MAIN }
 *   @desc:     { 清除当前库存 }
 */
module.exports.delUdtTbEwmstorageinfo = () =>
  DEV
    ? mock(_commonData)
    : axios({
        url: '/465/7e06d2db7e.json'
      });

/**
 *   @database: { MES_MAIN }
 *   @desc:     { 清除装箱今日入库数据 }
 */
module.exports.delUdtTbEwminstorage = () =>
  DEV
    ? mock(_commonData)
    : axios({
        url: '/466/4de12c9317.json'
      });

/**
 *   @database: { MES_MAIN }
 *   @desc:     { 清除装箱今日出库数据 }
 */
module.exports.delUdtTbEwmoutstorage = () =>
  DEV
    ? mock(_commonData)
    : axios({
        url: '/467/f5562a0731.json'
      });
