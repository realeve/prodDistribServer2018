let db = require('../util/db_sync_noteAnay');

let task_name = '同步单开仪生产信息';
const init = async () => {
  await noteanay();
};

const noteanay = async () => {
  // let data = await db.getCartInfoByGZ({ prod:'9603A', code:'U3A214', kilo:'0-4' } );
  // console.log(data);
  let { data: taskList } = await db.getNoteaysdata();
  if (taskList.length == 0) {
    console.log('当前无' + task_name + '产品信息同步');
    return true;
  }
  let len = taskList.length;
  for (let i = 0; i < len; i++) {
    console.log(`${task_name}:${i + 1}/${taskList.length}`);
    await handleTask(taskList[i]);
    console.log(`单开仪：${i + 1}/${taskList.length} 同步完成`);
  }
  return true;
};

const handleTask = async ({ NoteAnayID, kilo, prod, code }) => {
  // 查询生产信息
  let { data } = await db.getCartInfoByGZ({ prod, code, kilo });
  // data = data.map((item) => {
  //   Reflect.deleteProperty(item, 'WorkInfo');
  //   return { ...item, NoteAnayID };
  // });

  data = data.map((item) => ({ ...item, NoteAnayID }));
  // 记录生产信息
  if (data.length > 0) {
    let res = await db.addCartinfodata(data);
    // 更新车号
    if (res.data[0].affected_rows > 0) {
      let cart = data[0].CartNumber,
        note_id = NoteAnayID;
      res = await db.setNoteaysdata({ cart, note_id });
    }
  }
};
module.exports = { init };
