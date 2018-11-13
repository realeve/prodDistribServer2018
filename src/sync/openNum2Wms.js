let db = require('../util/db_opennum2wms');
const { handleOpenNum } = require('./fakeAfterSinyin');
let R = require('ramda');
const wms = require('../util/wms');

let task_name = '同步开包量信息写至立体库';

const init = async () => {
  let { data: taskList } = await db.getVwWimWhitelist();
  for (let i = 0; i < taskList.length; i++) {
    console.log(`${task_name}:${i + 1}/${taskList.length}`);
    await handleMahouTask(taskList[i]);
    console.log(`立体库开包量：${i + 1}/${taskList.length} 同步完成`);
  }
  return true;
};

const handleMahouTask = async ({ prod_id, car_no }) => {
  let { ex_opennum: open_num } = await handleOpenNum(car_no);
  let { handled } = await wms.updateWmsOpenNum({ open_num, car_no, prod_id });
  if (handled.length == 0) {
    console.log(cart + '生产信息写入失败.');
    return;
  }
  console.log({ open_num, car_no, prod_id });
};

module.exports = { init };
