let db = require('../util/db_erweima');
let lib = require('../util/lib');
let task_name = '装箱二维码系统数据同步';

const init = async () => {
  let tstart = lib.ymd();
  let params = { tstart, tend: tstart };
  await operation_In(params);
  await operation_Out(params);
  await operation_Storage(params);

  return true;
};

const operation_In = async (params) => {
  let { data } = await db.getVCpkIn(params);
  if (data.length == 0) {
    return;
  }
  // console.log(data);
  // 先清数据,再写数据
  db.delUdtTbEwminstorage()
    .then(() => {
      db.addUdtTbEwminstorage(data);
      console.log(task_name, '入库数据同步完成', lib.now());
    })
    .catch((e) => {
      console.log(task_name, '入库数据同步失败', lib.now());
      console.log(e);
    });
};

const operation_Out = async (params) => {
  let { data } = await db.getVCpkOut(params);
  if (data.length == 0) {
    return;
  }
  // 先清数据,再写数据
  db.delUdtTbEwmoutstorage()
    .then(() => {
      db.addUdtTbEwmoutstorage(data);
      console.log(task_name, '出库数据同步完成', lib.now());
    })
    .catch((e) => {
      console.log(task_name, '出库数据同步失败', lib.now());
      console.log(e);
    });
};
const operation_Storage = async (params) => {
  let { data } = await db.getVCpk(params);
  if (data.length == 0) {
    return;
  }
  // 先清数据,再写数据
  db.delUdtTbEwmstorageinfo()
    .then(() => {
      db.addUdtTbEwmstorageinfo(data);
      console.log(task_name, '库存数据同步完成', lib.now());
    })
    .catch((e) => {
      console.log(task_name, '库存数据同步失败', lib.now());
      console.log(e);
    });
};

module.exports = { init };
