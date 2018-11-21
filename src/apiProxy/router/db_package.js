const { axios, dev } = require('../../util/axios');
const R = require('ramda');

const getTimeRange = () => {
  let curHour = parseInt(moment().format('HHMM'), 10);
  let timeRange = 2;
  // 下午14点30排中班任务,持续到15点59
  if (curHour >= 1430 && curHour <= 1559) {
    timeRange = 1;
  } else if (curHour >= 500 && curHour <= 659) {
    // 中上5点排白班任务，如果报错一直持续到6点。
    timeRange = 0;
  }
  return timeRange;
};

const getWorkTypes = () => {
  let timeRange = getTimeRange();
  return ['白班', '中班', ''][timeRange];
};

module.exports.getTimeRange = getTimeRange;

const moment = require('moment');
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
 *   @database: { 全幅面 }
 *   @desc:     { 码后核查判废完工车号列表 }
 */
module.exports.getQfmWipJobs = (carts) =>
  axios({
    url: '/250/b3d68925f6.array',
    params: {
      carts
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
 *   @desc:     { 各品种开包量限额 }
 */
module.exports.getProductdata = () =>
  axios({
    url: '/272/eae49a15d0.json'
  });
