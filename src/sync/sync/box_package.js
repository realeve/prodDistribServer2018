let db = require('../util/db_erweima');
let lib = require('../util/lib');
let task_name = '装箱二维码系统数据同步';

/** 业务说明 
54002780(李宾) 05-16 11:11:56
重新跟鲁可确认了需求，跟最初王瑞心说的有调整：
54002780(李宾) 05-16 11:12:12
1.三张表 In,Out,Info分别是入库，出库，在库情况
54002780(李宾) 05-16 11:12:33
入库：记录当天入临时库，入成品库（以前是临库在库情况）
54002780(李宾) 05-16 11:12:47
出库：出入成品库的都视为出库。只是 source来源不同
54001987(倪震) 05-16 11:13:22
对
54002780(李宾) 05-16 11:13:26
在库情况：临库在库与成品库在库。临时库（有打印D没有入成品库R），成品库（有入成品库R，没有解缴J）
54002780(李宾) 05-16 11:13:40
都按当天的记录来。
*/
const init = async () => {
  let tstart = lib.ymd();
  let params = { tstart, tend: tstart };

  // 临库中出入记录: R+D 入成品库+打印入临库
  await operation_In(params);

  // 成品库出入记录：R+C 出临库R+出成品库C
  await operation_Out(params);

  // 在库情况：不能含日期，直接查询所有记录
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
