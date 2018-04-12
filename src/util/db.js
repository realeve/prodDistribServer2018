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

/**
*   @database: { 质量信息系统 }
*   @desc:     { 更新四新计划状态信息 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@id:_id. 参数说明：api 索引序号
  
    const { complete_num, complete_status, update_time, _id } = params;
*/
const setPrintNewprocPlan = async params =>
  await axios({
    url: "/90/a6c66f8d72.json",
    params
  }).then(res => res);

/**
*   @database: { 质量信息系统 }
*   @desc:     { 批量记录库管系统日志信息 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@desc:批量插入数据时，约定使用二维数组values参数，格式为[{remark,rec_time,return_info }]，数组的每一项表示一条数据*/
const addPrintWmsLog = async values =>
  await axios({
    method: "post",
    data: {
      values,
      id: 91,
      nonce: "f0500427cb"
    }
  }).then(res => res);
module.exports = {
  getPrintNewprocPlan,
  getCartList,
  getCartListWithDate,
  getCartListWithGZ,
  setPrintNewprocPlan,
  addPrintWmsLog,
  setPrintNewprocPlan,
  addPrintWmsLog
};
