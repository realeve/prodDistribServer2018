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
  "data": [{
    "id": "1",
    "date_type": "0",
    "machine_name": "M81D-2号机",
    "proc_name": "新设备",
    "prod_id": "4",
    "reason": "tes",
    "num1": "24.0",
    "num2": "0.0",
    "proc_stream1": "0",
    "proc_stream2": "2",
    "rec_date1": "2018-03-31 00:00:00",
    "rec_date2": null,
    "complete_num": "0",
    "complete_status": "0"
  }, {
    "id": "2",
    "date_type": "1",
    "machine_name": "多功能-3号机",
    "proc_name": "新设备",
    "prod_id": "4",
    "reason": "时间范围测试",
    "num1": null,
    "num2": null,
    "proc_stream1": "0",
    "proc_stream2": null,
    "rec_date1": "2018-03-31 00:00:00",
    "rec_date2": "2018-04-15 00:00:00",
    "complete_num": "0",
    "complete_status": "0"
  }],
  "title": "未完成的全检任务计划列表",
  "rows": 2,
  "time": "13.605ms",
  "header": ["id", "date_type", "machine_name", "proc_name", "prod_id",
    "reason", "num1", "num2", "proc_stream1", "proc_stream2", "rec_date1",
    "rec_date2", "complete_num", "complete_status"
  ]
}
*/

module.exports = {
  getPrintNewprocPlan
};
