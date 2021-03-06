let db = require('../util/db_sync_seriousImg');
let R = require('ramda');

let task_name = '同步严重废锁图信息';
const init = async () => {
  let { data } = await db.getSeriousImg();
  if (R.isNil(data) || data.length === 0) {
    console.info('所有任务处理完毕，下个周期继续');
    return;
  }

  let taskData = R.groupBy(R.nth(1))(data);

  let taskList = R.compose(
    R.map((cart) => {
      const images = R.map(R.nth(2))(taskData[cart]);
      return { cart, images };
    }),
    R.keys
  )(taskData);

  const uniqCarts = taskList.map(({ cart }) => cart);
  let res = await db.getViewCartfinder(uniqCarts);

  // 全检品列表
  let notSync = R.flatten(res.data);
  await db.setSeriousImgNotSync(notSync);
  console.log('以下全检品无需更新:', notSync);

  // taskList = R.reject(item => notSync.includes(item))(taskList);

  // 过滤出已同步的数据
  taskList = R.difference(taskList, notSync);

  for (let i = 0; i < taskList.length; i++) {
    console.log(`正在同步第${i + 1}/${taskList.length}条图像锁定数据`);
    await handleTask(taskList[i]);
  }
};

// 处理单万结果
const handleTask = async (task) => {
  // 判废结果
  const { data } = await db.getQfmWipJobs(task);

  let result = R.groupBy(R.prop('item_flag'))(data);
  let resultList = R.keys(result);
  resultList.forEach(async (status) => {
    const img_id = R.compose(
      R.map((item) => parseInt(item, 10)),
      R.map(R.prop('image_index'))
    )(result[status]);
    console.log({ status, img_id, cart: task.cart });
    let data = await db.setSeriousImg({ status, img_id, cart: task.cart });
  });
};

module.exports = { init };
