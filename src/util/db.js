let { axios } = require("./axios");

/**
*   @database: { 质量信息系统 }
*   @desc:     { 未完成的全检任务计划列表 } 
  
*/
const getPrintNewprocPlan = async () =>
  await axios({
    url: "/78/b36aab89f7.json"
  }).then(res => res);

module.exports = {
  getPrintNewprocPlan
};
