let { axios } = require("./axios");

/**
*   @database: { 质量信息系统 }
*   @desc:     { 未完成的全检任务计划列表 } 
  
*/
const getPrintNewprocPlan = async () =>
  await axios({
    url: "/78/b36aab89f7.json"
  }).then(res => res);
/*
{
  "data": [
    {
      "id": "1",
      "date_type": "0",
      "machine_name": "M81D-2号机",
      "proc_name": "新设备",
      "ProductName": "9604A     ",
      "reason": "tes",
      "num1": "24.0",
      "num2": "0.0",
      "proc_stream1": "0",
      "proc_stream2": "2",
      "rec_date1": "20180331",
      "rec_date2": null,
      "complete_num": "0",
      "complete_status": "0"
    },
    {
      "id": "2",
      "date_type": "1",
      "machine_name": "多功能-3号机",
      "proc_name": "新设备",
      "ProductName": "9604A     ",
      "reason": "时间范围测试",
      "num1": "0.0",
      "num2": "0.0",
      "proc_stream1": "0",
      "proc_stream2": null,
      "rec_date1": "20180331",
      "rec_date2": "20180415",
      "complete_num": "0",
      "complete_status": "0"
    }
  ],
  "title": "未完成的全检任务计划列表",
  "rows": 2,
  "time": "36.027ms",
  "header": [
    "id",
    "date_type",
    "machine_name",
    "proc_name",
    "ProductName",
    "reason",
    "num1",
    "num2",
    "proc_stream1",
    "proc_stream2",
    "rec_date1",
    "rec_date2",
    "complete_num",
    "complete_status"
  ]
}

*/

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

module.exports = {
  getPrintNewprocPlan,
  getCartList,
  getCartListWithDate
};
