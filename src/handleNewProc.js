let db = require("./util/db");
let R = require("ramda");

let stepIdx = 1;
const init = async () => {
  console.log(`step${stepIdx++}: 获取四新任务列表`);
  let data = await db.getPrintNewprocPlan();
  if (data.rows === 0) {
    console.log(`step${stepIdx++}: 四新任务列表为空`);
  }
  console.log(`step${stepIdx++}: 共获取到${data.rows}条任务`);
  data.data.forEach((item, idx) => {
    console.log(`       开始处理任务${idx + 1}/${data.rows}:`);
    handlePlanList(item);
  });
};

let handlePlanList = data => {};

module.exports = { init };
