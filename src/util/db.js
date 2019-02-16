let { axios } = require('./axios');
let http = require('axios');

// const {title,msg,receiver} = params
const pushRTXInfo = async (params) =>
  await http({
    url: 'http://10.8.2.133/datainterface/rtxpush',
    params
  }).then(({ data }) => data);
/**
*   @database: { 质量信息系统 }
*   @desc:     { 未完成的全检任务计划列表 } 

  2018-04-11 更新
  SELECT a.id,a.date_type,a.machine_name,a.proc_name,rtrim(b.ProductName) ProductName,a.reason,isnull(a.num1,0) num1,isnull(a.num2,0) num2,a.proc_stream1,a.proc_stream2,CONVERT (VARCHAR,a.rec_date1,112) rec_date1,CONVERT (VARCHAR,a.rec_date2,112) rec_date2,a.complete_num,a.complete_status,a.alpha_num FROM dbo.print_newproc_plan AS a INNER JOIN ProductData b on a.prod_id = b.ProductID WHERE a.complete_status = 0
*/
const getPrintNewprocPlan = async () =>
  await axios({
    url: '/78/b36aab89f7.json'
  }).then((res) => res);

/**
*   @database: { 机台作业 }
*   @desc:     { 机台从某天起生产的X万产品车号列表 } 
    const { machine_name,  rec_date,  max_carts } = params;
*/
const getCartList = async (params) =>
  await axios({
    url: '/106/f47aa951dd/array.json',
    params
  }).then((res) => res);

/**
*   @database: { 质量信息系统 }
*   @desc:     { 机台某段时间生产的车号列表 } 
    const { machine_name,rec_date1,rec_date2 } = params;
*/
const getCartListWithDate = async (params) =>
  await axios({
    url: '/107/4463f2c07c/array.json',
    params
  }).then((res) => res);

/**
*   @database: { 机台作业 }
*   @desc:     { 某冠字号段车号列表 } 
    const { prod_name,  gz,  start_no,  end_no } = params;
*/
const getCartListWithGZ = async (params) =>
  await axios({
    url: '/108/cf760bfe6d/array.json',
    params
  }).then((res) => res);

/**
*   @database: { 质量信息系统 }
*   @desc:     { 更新四新计划状态信息 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@id:_id. 参数说明：api 索引序号
  
    const { complete_num, complete_status, update_time, _id } = params;
*/
const setPrintNewprocPlan = async (params) =>
  await axios({
    url: '/90/a6c66f8d72.json',
    params
  }).then((res) => res);

/**
*   @database: { 质量信息系统 }
*   @desc:     { 批量记录库管系统日志信息 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@desc:批量插入数据时，约定使用二维数组values参数，格式为[{remark,rec_time }]，数组的每一项表示一条数据*/
const addPrintWmsLog = async (values) =>
  await axios({
    method: 'post',
    data: {
      values,
      id: 91,
      nonce: 'f0500427cb'
    }
  }).then((res) => res);

/**
*   @database: { 质量信息系统 }
*   @desc:     { 更新wms日志信息 } 
    const { return_info, _id } = params;
*/
const setPrintWmsLog = async (params) =>
  await axios({
    url: '/120/e7d88969ca.json',
    params
  }).then((res) => res);

/**
*   @database: { 质量信息系统 }
*   @desc:     { 批量批量插入立体库四新计划工艺流转信息 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@desc:批量插入数据时，约定使用二维数组values参数，格式为[{cart_number,gz_num,proc_plan,proc_real,rec_time }]，数组的每一项表示一条数据*/
const addPrintWmsProclist = async (values) =>
  await axios({
    method: 'post',
    data: {
      values,
      id: 92,
      nonce: 'db02022755'
    }
  }).then((res) => res);

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 未处理的异常品列表 }
 */
const getPrintAbnormalProd = async () =>
  await axios({
    url: '/93/ba126b61bf.json'
  }).then((res) => res);

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 记录异常品任务处理状态 }
 */
const setPrintAbnormalProd = async (cart_number) =>
  await axios({
    url: '/94/ae030c585f.json',
    params: {
      cart_number
    }
  }).then((res) => res);

/**
*   @database: { 质量信息系统 }
*   @desc:     { 更新NodeJS 服务心跳 } 
    const { rec_time, task_name } = params;
*/
const addPrintWmsHeartbeat = async (params) =>
  await axios({
    url: '/95/eb4416dc92.json',
    params
  }).then((res) => res);

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 查询NodeJS 服务心跳 }
 */
const getPrintWmsHeartbeat = async () =>
  await axios({
    url: '/96/8d7c52c835.json'
  }).then((res) => res);
/**
*   @database: { 质量信息系统 }
*   @desc:     { 更新Nodejs 服务心跳 } 
    const { rec_time, task_name } = params;
*/
const setPrintWmsHeartbeat = async (params) =>
  await axios({
    url: '/97/c7677a2271.json',
    params
  }).then((res) => res);

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 自动排活待处理列表 }
 */
const getPrintSampleCartlist = async () =>
  await axios({
    url: '/98/8832903756.json'
  }).then((res) => res);

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 连续废通知未生产完毕车号列表 }
 */
const getPrintMachinecheckMultiweak = async () =>
  await axios({
    url: '/99/4c9141bdd3.json'
  }).then((res) => res);

/**
*   @database: { 机台作业 }
*   @desc:     { 车号最近生产工序 } 
    @sql:  select 车号 "cart_number",工序 "last_proc",机台 "machine_name" to_char(生产时间,'YYYY-MM-DD HH24:mi:ss') rec_time from VIEW_CARTFINDER where key_recid in (select max(key_recid) key_recid from VIEW_CARTFINDER t where 车号 in (?) group by 车号) and 车号 in (?)
    const { cart1, cart2 } = params;
*/
const getViewCartfinder = async (params) =>
  await axios({
    url: '/100/97cfc715f4.json',
    params
  }).then((res) => res);

/**
*   @database: { MES_MAIN }
*   @desc:     { 车号最近生产工序 } 
    const { cart1, cart2 } = params;
*/
const getVCbpcCartlist = (params) =>
  axios({
    url: '/346/d46d77fb86.json',
    params
  });

/**
*   @database: { 质量信息系统 }
*   @desc:     { 更新连续废通知产品生产进度信息 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@id:_id. 参数说明：api 索引序号
    const { last_proc, last_machine, last_rec_time, _id } = params;
*/
const setPrintMachinecheckMultiweak = async (params) =>
  await axios({
    url: '/101/f4f2a8ef0f.json',
    params
  }).then((res) => res);

/**
*   @database: { 质量信息系统 }
*   @desc:     { 根据id信息查询连续废通知情况 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@id:_id. 参数说明：api 索引序号
      */
const getPrintMachinecheckMultiweakById = async (_id) =>
  await axios({
    url: '/102/66373f0467.json',
    params: {
      _id
    }
  }).then((res) => res);

/**
*   @database: { 质量信息系统 }
*   @desc:     { 连续废通知产品已完工 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@id:_id. 参数说明：api 索引序号
      */
const setPrintMachinecheckMultiweakStatus = async (_id) =>
  await axios({
    url: '/103/1db66c49a0.json',
    params: {
      _id
    }
  }).then((res) => res);

/**
 *   @database: { 机台作业 }
 *   @desc:     { 车号查冠字 }
 */
const getViewCartfinderGZ = async (carnos) =>
  await axios({
    url: '/105/153ec8ad02.json',
    params: {
      carnos
    }
  }).then((res) => res);

/**
 *   @database: { MES_MAIN }
 *   @desc:     { 车号查冠字 }
 */
const getVCbpcCartlistGZ = (carnos) =>
  axios({
    url: '/347/d0fdd5b3d1.json',
    params: {
      carnos
    }
  });

/**
*   @database: { 质量信息系统 }
*   @desc:     { 过滤已处理的四新或异常品车号列表 } 
    const { check_type, task_id } = params;
*/
const getPrintWmsProclist = async (params) =>
  await axios({
    url: '/109/95aa0001e8.json',
    params
  }).then((res) => res);

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 当前车号是否有连续废通知 }
 */
const getPrintMachinecheckMultiweakByCart = async (cart) =>
  await axios({
    url: '/116/c96d2b8975.json',
    params: {
      cart
    }
  }).then((res) => res);

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 锁车产品待推送车号列表 }
 */
const getCartsNeedPush = async () =>
  await axios({
    url: '/165/3c1ac0c5ad.json'
  }).then((res) => res);

// {
//   "data": [{
//     "cart_number": "1820B740",
//     "user_name": "李宾"
//   }],
//   "title": "锁车产品待推送车号列表",
//   "rows": 1,
//   "time": "4.15ms",
//   "header": ["cart_number", "user_name"],
//   "source": "数据来源：质量信息系统"
// }

// R.groupBy(item=>item.user_name,data)

/**
*   @database: { 库管系统 }
*   @desc:     { 查询批次状态 } 
    const { carnos1, carnos2, carnos3 } = params;
*/
const getTbbaseCarTechnologyHistory = async (carnos1) =>
  await axios({
    url: '/132/6ac1e30d85.json',
    params: {
      carnos1,
      carnos2: carnos1,
      carnos3: carnos1
    }
  }).then((res) => res);

// data 返回为空时，表示已完工，应更新当前状态为已解锁
// {
//     "data": [
//         ["1号库房", "9602A主业品", "1820C695", "大张号票待干品", "400000", "锁定", "q_abnormalProd", "码后核查"]
//     ],
//     "title": "查询批次状态",
//     "rows": 1,
//     "time": "357.238ms",
//     "header": ["库房", "品种", "车号", "工序", "数量", "锁车状态", "锁车原因", "工艺"],
//     "source": "数据来源：库管系统"
// }

/**
*   @database: { 质量信息系统 }
*   @desc:     { 批量解锁 } 
    const { remark, carts } = params;
*/
const unlockCartsBySys = async (params) =>
  await axios({
    url: '/139/00cbb681ae.json',
    params
  }).then((res) => res);

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 更新推送时间 }
 */
const updatePushTime = async (carts) =>
  await axios({
    url: '/166/8b4c3a7d44.json',
    params: {
      carts
    }
  }).then((res) => res);

module.exports = {
  updatePushTime,
  unlockCartsBySys,
  getTbbaseCarTechnologyHistory,
  getCartsNeedPush,
  getPrintNewprocPlan,
  getCartList,
  getCartListWithDate,
  getCartListWithGZ,
  setPrintNewprocPlan,
  addPrintWmsLog,
  setPrintWmsLog,
  setPrintNewprocPlan,
  addPrintWmsProclist,
  getPrintAbnormalProd,
  setPrintAbnormalProd,
  addPrintWmsHeartbeat,
  getPrintWmsHeartbeat,
  setPrintWmsHeartbeat,
  getPrintSampleCartlist,
  getPrintMachinecheckMultiweak,
  getViewCartfinder: getVCbpcCartlist,
  getViewCartfinderGZ: getVCbpcCartlistGZ,
  setPrintMachinecheckMultiweak,
  getPrintMachinecheckMultiweakById,
  setPrintMachinecheckMultiweakStatus,
  getPrintWmsProclist,
  pushRTXInfo,
  getPrintMachinecheckMultiweakByCart
};
