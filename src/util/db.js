let { axios } = require("./axios");

/**
*   @database: { 质量信息系统 }
*   @desc:     { 未完成的全检任务计划列表 } 

  2018-04-11 更新
  SELECT a.id,a.date_type,a.machine_name,a.proc_name,b.ProductName,a.reason,isnull(a.num1,0) num1,isnull(a.num2,0) num2,a.proc_stream1,a.proc_stream2,CONVERT (VARCHAR,a.rec_date1,112) rec_date1,CONVERT (VARCHAR,a.rec_date2,112) rec_date2,a.complete_num,a.complete_status,a.alpha_num FROM dbo.print_newproc_plan AS a INNER JOIN ProductData b on a.prod_id = b.ProductID WHERE a.complete_status = 0
*/
const getPrintNewprocPlan = async () =>
  await axios({
    url: "/78/b36aab89f7.json"
  }).then(res => res);

const getCartList = async ({ machine_name, rec_date1 }) => {
  let arr = [];
  for (let i = 100; i < 200; i++) {
    arr.push(`1620A${i}`);
  }
  return arr;
};

const getCartListWithDate = async ({ machine_name, rec_date1, rec_date2 }) => {
  let arr = [];
  for (let i = 100; i < 200; i++) {
    arr.push(`1620A${i}`);
  }
  return arr;
};

const getCartListWithGZ = async ({ prod_name, gz, start_no, end_no }) => {
  let arr = [];
  for (let i = 100; i < 200; i++) {
    arr.push(`1620A${i}`);
  }
  return arr;
};

module.exports = {
  getPrintNewprocPlan,
  getCartList,
  getCartListWithDate,
  getCartListWithGZ
};
