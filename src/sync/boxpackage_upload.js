let { axios } = require("../util/axios");
let task_name = "装箱数据状态同步";
const R = require("ramda");

/** NodeJS服务端调用：
 *
 *   @database: { MES系统_生产环境 }
 *   @desc:     { 待同步未上传的数据列表 }
 */
const getCbpcPackageDataupload = (baseid = 1) =>
  axios({
    url: "/1233/c40205b59a.json",
    params: {
      baseid,
    },
  });

/**
 *   @database: { 检封装箱系统 }
 *   @desc:     { 指定品种冠字装箱数据采集情况 }
 */
const getQaPacketMaster = (params) =>
  axios({
    url: "/1232/eef189df21.json",
    params,
  });
/**
*   @database: { MES系统_生产环境 }
*   @desc:     { 更新数据上传情况 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@id:_id. 参数说明：api 索引序号 
*/
const setCbpcPackageDataupload = (params) =>
  axios({
    url: "/1234/737b938c0a.json",
    params,
  }).then(({ data: [{ affected_rows }] }) => affected_rows > 0);

const handleTaskItem = async ({ id: _id, ...param }) => {
  let res = await getQaPacketMaster(param);
  if (res.rows === 0) {
    return;
  }
  let box_num = res.data[0].num;
  await setCbpcPackageDataupload({
    _id,
    box_num,
  });
  // 更新数据
};

const getTaskList = async (id) => {
  const res = await getCbpcPackageDataupload(id);

  if (res.rows === 0) {
    console.info(`${task_name} 当前无新任务`);
    return false;
  }

  for (let i = 0; i < res.rows; i++) {
    if (i % 10 == 0) {
      console.log(`${id}:${task_name}:${i + 1}/${res.rows}`);
    }
    await handleTaskItem(res.data[i]);
  }

  const lastItem = R.last(res.data);

  return lastItem.id;
};

// 35925,此前的数据
const init = async () => {
  let isComplete = false;
  let lastId = 0;
  // 不断循环
  while (!isComplete) {
    let res = await getTaskList(lastId);
    console.log(res);
    if (!res) {
      isComplete = true;
    } else {
      lastId = res;
    }
  }
  console.info(`${task_name} 数据处理完成`);
};

module.exports = { init };
