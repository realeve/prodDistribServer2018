const { axios, dev } = require('../../util/axios');
const R = require('ramda');
const moment = require('moment');

const getTimeRange = (testHour) => {
  let curHour = testHour || parseInt(moment().format('HHMM'), 10);
  let timeRange = 2;
  // 下午14点30排中班任务,持续到15点59
  if (curHour >= 1430 && curHour <= 1559) {
    // 此处将2559 改为1559
    timeRange = 1;
  } else if (curHour >= 630 && curHour <= 730) {
    // 中上5点排白班任务，如果报错一直持续到6点。
    timeRange = 0;
  }
  return timeRange;
};

const getWorkTypes = (testHour = false) => {
  let timeRange = getTimeRange(testHour);
  return ['白班', '中班', ''][timeRange];
};

const getWorkTypesManual = (testHour = false) => {
  let curHour = testHour || parseInt(moment().format('HHMM'), 10);
  let timeRange = 2;
  // 下午14点30排中班任务,持续到15点59
  if (curHour >= 1430 && curHour <= 2359) {
    timeRange = 1;
  } else if (curHour >= 630 && curHour <= 1429) {
    // 中上5点排白班任务，如果报错一直持续到6点。
    timeRange = 0;
  }
  return ['白班', '中班', ''][timeRange];
};

module.exports.getWorkTypes = getWorkTypes;
module.exports.getTimeRange = getTimeRange;
module.exports.getWorkTypesManual = getWorkTypesManual;

/** NodeJS服务端调用：
 *
 *   @database: { 库管系统 }
 *   @desc:     { 码后核查在库产品查询 }
 */
module.exports.getVwWimWhitelist = (proc_type = '码后核查') =>
  dev
    ? require(`../mock/package_list${proc_type == '码后核查' ? '' : '2'}`)
    : axios({
        url: '/249/f15c70ab61.json',
        params: {
          proc_type
        }
      });

/** NodeJS服务端调用：
 *
 *   @database: { MES系统_生产环境 }
 *   @desc:     { 码后核查在库产品查询 }
 */
module.exports.getVCbpcWhitelist = (proc_type = '码后核查') =>
  axios({
    url: '/586/59bbb64465.json',
    params: {
      proc_type
    }
  });

/** NodeJS服务端调用：
 *
 *   @database: { 全幅面 }
 *   @desc:     { 码后核查判废完工车号列表 }
 */
module.exports.getQfmWipJobs = (carts) =>
  axios({
    method: 'post',
    data: {
      carts,
      id: 250,
      nonce: 'b3d68925f6',
      mode: 'array'
    }
  }).then(({ data }) => R.uniq(R.flatten(data)));

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 指定车号列表开包量查询 }
 */
module.exports.getManualverifydata = (carts) =>
  axios({
    url: '/251/43da90eb45.json',
    params: {
      carts
    }
  }).then(({ data }) =>
    R.map((item) => {
      item.opennum = parseInt(item.opennum, 10);
      item.ex_opennum = parseInt(item.ex_opennum, 10);
      return item;
    })(data)
  );

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 检封自动排产任务设置 }
 */
module.exports.getPrintCutTaskList = (worktypes = getWorkTypes()) =>
  dev
    ? require('../mock/package_machine_setting')
    : axios({
        url: '/267/e0cf91d414.json',
        params: {
          worktypes
        }
      });

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 检封自动排产任务设置 }
 */
module.exports.getPrintCutTaskListManual = (worktypes = getWorkTypesManual()) =>
  axios({
    url: '/279/48ac2dc14d.json',
    params: {
      worktypes
    }
  });

/** NodeJS服务端调用：
 *
 *   @database: { 库管系统 }
 *   @desc:     { 指定车号在库信息查询 }
 */
module.exports.getVwWimWhitelistWithCarts = (carts) =>
  axios({
    url: '/268/5c9f14f76f.json',
    params: {
      carts
    }
  });

/** 数据量较大时建议使用post模式：
  *
  *   @database: { 质量信息系统 }
  *   @desc:     { 批量批量记录检封排产任务 } 
      以下参数在建立过程中与系统保留字段冲突，已自动替换:
      @desc:批量插入数据时，约定使用二维数组values参数，格式为[{task_id,type,expect_num,real_num,gh,prodname,tech,carno,ex_opennum,status,rec_date }]，数组的每一项表示一条数据*/

module.exports.addPrintCutProdLog = (values) =>
  axios({
    method: 'post',
    data: {
      values,
      id: 270,
      nonce: '6f3ed8e1ec'
    }
  });

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 更新任务状态 }
 */
module.exports.setPrintCutTaskStatus = (task_id) =>
  axios({
    url: '/271/46fd372b56.json',
    params: {
      task_id
    }
  });

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 更新当前班次排产状态 }
 */
module.exports.setPrintCutTask = (worktype = getTimeRange() + 1) => {
  console.log(worktype);
  return axios({
    url: '/293/ac87697ca1.json',
    params: {
      worktype
    }
  });
};

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 各品种开包量限额 }
 */
module.exports.getProductdata = () =>
  axios({
    url: '/272/eae49a15d0.json'
  });

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 当天产品取消生产 }
 */
module.exports.setPrintCutProdLogCancel = () =>
  axios({
    url: '/280/a267292c67.json'
  });

/** NodeJS服务端调用：
*
*   @database: { 质量信息系统 }
*   @desc:     { 检封排产-记录立体库白名单日志 } 
    const { remark, rec_time } = params;
*/
module.exports.addPrintCutWmsLog = (params) =>
  axios({
    method: 'post',
    data: {
      ...params,
      id: 292,
      nonce: '24d9222347'
    }
  });

/**
 *   @database: { MES系统_生产环境 }
 *   @desc:     { 清空当前班次均衡生产黑名单产品 }
 */
module.exports.delUdtDiQualityInterface = () =>
  axios({
    url: '/594/4e607123a7.json'
  });

/** NodeJS服务端调用：
*
*   @database: { MES系统_生产环境 }
*   @desc:     { 写入检封均衡生产黑名单产品列表 } 
    const { carno, biztype, excutetime } = params;
*/
module.exports.addUdtDiQualityInterface = (params) =>
  axios({
    url: '/595/ae34ce8c72.json',
    params
  });
