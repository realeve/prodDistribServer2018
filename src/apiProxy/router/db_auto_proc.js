const R = require('ramda');
const { axios, dev } = require('../../util/axios');
const lib = require('../../util/lib');
const wms = require('../../util/wms');

module.exports.dev = dev;

/**
*   @database: { MES系统_生产环境 }
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
 *   @desc:     { 实时获取丝印近400车产品建议走码后及全检品实废数 }
 */
const getCartThread = () =>
  axios({
    url: '/288/951314319e.json'
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
const addPrintWmsAutoproc = async (params) => {
  // 如果已插入，放弃
  // let { rows } = await getPrintWmsAutoprocStatus(params.cart);
  // if (rows > 0) {
  //   return false;
  // }

  return axios({
    url: '/287/ec7940dc77.json',
    params
  });
};

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 当前车号是否已处理过 }
 */
const getPrintWmsAutoprocStatus = (cart) =>
  axios({
    url: '/291/68875f126c.json',
    params: {
      cart
    }
  });

/**
*   @database: { 质量信息系统 }
*   @desc:     { 批量记录库管系统日志信息 }  
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

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 车号列表工艺调整 }
 */
const getPrintWmsAutoproc = () =>
  axios({
    url: '/290/c27b6f038a.json'
  });

// 2018-12-04 部分车号因接口添加过程中指定了车号，原工艺重新调整

module.exports.repaire = async () => {
  return { status: 'finished' };

  // http://10.8.2.133/qualitytable?tid=337,520&multi=cart&fixheader=0
  // 截止至20181204，该组车号已确认全部未上印码机，尚在凹印工序。
  // 1880F896,1880K196,1880G147,1880G143,1880K164,1880K259,1880K190,1880K234,1880K216,1880K172,1880G126,1880K242,1880K178,1880G148,1880G165,1880G132,1880K183,1880K197,1880G146,1880G135,1880F904,1880F838,1880G151,1880G159,1880G157,1880K173,1880G169,1880K188,1880K155,1880G182,1880G061,1880K199,1880K162,1880G121,1880G134,1880K157,1880F917,1880G152,1880F881,1880G140,1880G133,1880K147,1880K184,1880G175,1880G177,1880K180,1880G219,1880K236,1880G180,1880K224,1880G183,1880K232,1880G171,1880F876,1880G178,1880K280,1880G168,1880G136,1880G131,1880G181,1880G052,1880K171,1880K204,1880G026,1880F948,1880K267,1880F987,1880K287,1880G224
  let { data } = await getPrintWmsAutoproc();
  let carts = R.compose(
    R.flatten,
    R.map(R.prop('cart'))
  )(data);

  // 记录WMS转工艺日志
  let logInfo = await addPrintWmsLog([
    {
      remark: JSON.stringify(carts),
      rec_time: lib.now()
    }
  ]);

  // 添加日志正常？
  if (logInfo.rows < 1 || logInfo.data[0].affected_rows < 1) {
    console.log('码前分流，wms记录失败', logInfo);
    return false;
  }
  let log_id = logInfo.data[0].id;

  // 重置为不分工艺
  let result = await wms.setProcs({
    carnos: carts,
    checkType: '不分工艺',
    log_id
  });

  // 根据情况重设工艺
  for (let i = 0; i < carts.length; i++) {
    await init({ cart: carts[i], process: '凹二印' });
  }
  return result;
};

// 码前分流
const init = async ({ cart, process }, devMode = false) => {
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
  // 2018-11-29 从丝印判废中实时读取近400车数据
  // 2019-07-24 调整为：25%以下转码后，80%以上转全检
  let {
    data: [{ mahou, allcheck }]
  } = await getCartThread();

  mahou = parseInt(mahou);
  allcheck = parseInt(allcheck);
  // 3.3 判废期望工艺；

  let checkType = '';
  let errFlag = false;
  if (fake_num > mahou && fake_num < allcheck) {
    errFlag = true;
    checkType = '不分工艺';
    console.log(
      cart +
        `当前实废${fake_num}介于推荐值${mahou}和${allcheck}之间，不执行自动分流设置。`
    );
  } else if (fake_num <= mahou) {
    // 建议执行码后
    checkType = '码后核查';
  } else if (fake_num >= allcheck) {
    // 建议执行全检
    checkType = '全检品';
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

  // 记录工艺自动分流信息,不分流的产品也作记录
  await addPrintWmsAutoproc(params);

  // 不转工艺的仍记录信息
  if (errFlag) {
    return false;
  }

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

module.exports.init = init;
