let db = require("../util/db");
let R = require("ramda");
let wms = require("../util/wms");
let lib = require("../util/lib");
const consola = require("consola");
const procHandler = require("../util/procHandler");

/**
 * @desc:异常品处理，初始化。
 * 按数据库的CRUD，具体流程如下：
 * 1.心跳记录，进入该流程；
 * 2.获取待处理的异常品列表，数据库端做以下处理：同一万产品，按最后一次提交的时间中所记录的工艺流程为准，即：
 * 时间A，码后核查工艺；时间B，全检工艺。以上情况按全检工艺执行。
 * 3.依次对以上列表中的大万号处理。
 */
const init = async () => {
  let task_name = "异常品工艺处理";
  await procHandler.recordHeartbeat(task_name);

  // 读取未处理的异常品车号，如果有多个工艺，按最后一次添加的为准
  let { data } = await db.getPrintAbnormalProd();
  console.log(data);
  if (R.isNil(data) || data.length === 0) {
    consola.info("所有任务处理完毕，下个周期继续");
    return;
  }

  // 处理所有车号信息
  data.forEach(handleAbnormalItem);
};

/**
 * @desc:异常品处理，处理具体的车号。
 * 按数据库的CRUD，具体流程如下：
 * 1.获取该任务id号已经处理的异常品列表；
 * 2.判断该万产品是否已经处理；
 * 3.对该万产品向立体库提交工艺变更请求；
 * 4.如果工艺变更成功，更新该万产品在任务列表中的状态id，下个流程中该万不再处理。
 */
const handleAbnormalItem = async ({ cart_number, proc_stream, id }) => {
  let check_type = "异常品处理",
    reason_code = "q_abnormalProd";
  let cartList = [cart_number];

  // 已经插入的车号列表
  let handledCartInfo = await db.getPrintWmsProclist({
    check_type,
    task_id: id
  });

  let handledCarts = R.map(R.prop("cart_number"))(handledCartInfo.data);
  consola.success("已处理的车号列表");
  console.log(handledCarts);
  cartList = R.difference(cartList, handledCarts);

  if (cartList.length === 0) {
    consola.info("当前车号已处理");
    return;
  }

  let res = await procHandler.handleProcStream({
    carnos: cartList,
    proc_stream,
    check_type,
    reason_code,
    task_id: id
  });
  console.log("工艺流程处理完毕");

  if (res.status) {
    // 异常品处理只会传入一万产品信息，如果返回的成功数据列表中只有一条，视为处理成功，更改后续的状态。
    if (res.result.handledList.length) {
      await db.setPrintAbnormalProd(cart_number);
    }
  }
  return res;
};

module.exports = { init };