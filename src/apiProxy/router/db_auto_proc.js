const R = require('ramda');
const { axios, dev } = require('../../util/axios');
const lib = require('../../util/lib');
const wms = require('../../util/wms');

module.exports.dev = dev;

/**
*   @database: { 库管系统 }
*   @desc:     { 查询批次状态 } 
    const { carnos1, carnos2, carnos3 } = params;
*/
const getTbbaseCarTechnologyHistory = (params) =>
  axios({
    url: '/132/6ac1e30d85.json',
    params
  });

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 近200车产品建议走码后及全检丝印实废条数 }
 */
const getManualverifydata = () =>
  axios({
    url: '/286/f4378a6d66.json'
  });

/**
 *   @database: { 小张核查 }
 *   @desc:     { 码前分流-丝印工序判废实废数及开包量 }
 */
const getQaRectifyMaster = (cart) =>
  axios({
    url: '/281/76f6def958.json',
    params: {
      cart
    }
  });

/**
*   @database: { 质量信息系统 }
*   @desc:     { 码前自动分流-记录自动分流信息 } 
    const { cart, rec_time, fake_num, mahou, allcheck, auto_proc_name } = params;
*/
const addPrintWmsAutoproc = (params) =>
  axios({
    url: '/287/ec7940dc77.json',
    params
  });

/**
*   @database: { 质量信息系统 }
*   @desc:     { 批量记录库管系统日志信息 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@desc:批量插入数据时，约定使用二维数组values参数，格式为[{remark,rec_time }]，数组的每一项表示一条数据*/
const addPrintWmsLog = (values) =>
  axios({
    method: 'post',
    data: {
      values,
      id: 91,
      nonce: 'f0500427cb'
    }
  });

/**
*   @database: { 质量信息系统 }
*   @desc:     { 更新wms日志信息 } 
    const { return_info, _id } = params;
*/
const setPrintWmsLog = (params) =>
  axios({
    url: '/120/e7d88969ca.json',
    params
  });

// 数据预处理
const preHandle = async ({ cart, process }) => {
  // 1.是否为9607T,是否为凹印工序
  if (cart[2] != '8' || !['凹印', '凹一印', '凹二印'].includes(process)) {
    return false;
  }

  // 2.是否设置过工艺
  let { data } = await getTbbaseCarTechnologyHistory({
    carnos1: cart,
    carnos2: cart,
    carnos3: cart
  });
  // 2.1 无记录，退出
  if (data.length === 0) {
    return false;
  }

  // 2.2 如果已设置，退出
  let statusInfo = data[0];
  let curProc = statusInfo['工艺'];
  if (curProc !== '不分工艺') {
    return false;
  }
  return true;
};

// 码前分流
module.exports.init = async ({ cart, process }, devMode = false) => {
  if (!(await preHandle({ cart, process }))) {
    return false;
  }

  // 3.如果以上条件均不满足，开始设置工艺信息
  // 3.1 读取当前实废值
  let res = await getQaRectifyMaster(cart);
  if (res.rows == 0) {
    console.log(cart + '判废未完成,退出码前分流设置.');
    return false;
  }
  let { fake_num } = res.data[0];
  fake_num = parseInt(fake_num);

  // 3.2 读取推荐码后、全检丝印实废阈值；
  let {
    data: [{ mahou, allcheck }]
  } = await getManualverifydata();
  mahou = parseInt(mahou);
  allcheck = parseInt(allcheck);
  // 3.3 判废期望工艺；

  let checkType = '';
  if (fake_num > mahou && fake_num < allcheck) {
    console.log(
      cart +
        `当前实废${fake_num}介于推荐值${mahou}和${allcheck}之间，不执行自动分流设置。`
    );
    return false;
  } else if (fake_num <= mahou) {
    // 建议执行码后
    checkType = '码后核查';
  } else if (fake_num >= allcheck) {
    // 建议执行全检
    checkType = '全检品';
  }
  if (checkType == '') {
    return;
  }

  let remark = {
    cart,
    fake_num,
    mahou,
    allcheck,
    auto_proc_name: checkType
  };

  let params = {
    rec_time: lib.now(),
    ...remark
  };

  // 记录工艺自动分流信息
  res = await addPrintWmsAutoproc(params);
  // 记录WMS转工艺日志
  let logInfo = await addPrintWmsLog([
    {
      remark: JSON.stringify(remark),
      rec_time: lib.now()
    }
  ]);

  // 添加日志正常？
  if (logInfo.rows < 1 || logInfo.data[0].affected_rows < 1) {
    console.log('码前分流，wms记录失败', logInfo);
    return false;
  }
  let log_id = logInfo.data[0].id;

  // 调试模式，直接输出向WMS发送的参数，不执行
  if (devMode) {
    return { carnos: [cart], checkType, log_id };
  }

  let result = await wms.setProcs({ carnos: [cart], checkType, log_id });
  // 更新日志返回信息
  await setPrintWmsLog({ return_info: JSON.stringify(result), _id: log_id });
  return result;
};
