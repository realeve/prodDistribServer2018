let db = require("./util/db");

const init = async () => {
  let data = await db.getPrintNewprocPlan();
  console.log(data);
};

module.exports = { init };
