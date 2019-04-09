let { addPrintWmsLog, setPrintWmsLog } = require('../../util/db');
const wms = require('../../util/wms');
let lib = require('../../util/lib');

// 人工大张完工入库

module.exports.init = async (cart) => {
  // 1.解锁
  await wms.setWhiteList([cart]);

  // 2.转码后核查工艺
  // 记录WMS转工艺日志
  let logInfo = await addPrintWmsLog([
    {
      remark: JSON.stringify({ msg: '大张拉号完工入库', cart }),
      rec_time: lib.now()
    }
  ]);
  // 添加日志正常？
  if (logInfo.rows < 1 || logInfo.data[0].affected_rows < 1) {
    console.log('大张拉号完工入库解锁失败', logInfo);
    return false;
  }
  let log_id = logInfo.data[0].id;

  let result = await wms.setProcs({
    carnos: [cart],
    checkType: '码后核查',
    log_id
  });
  // 更新日志返回信息
  return await setPrintWmsLog({
    return_info: JSON.stringify(result),
    _id: log_id
  });
};
