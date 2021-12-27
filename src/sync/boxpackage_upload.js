let { axios } = require("../util/axios");
let task_name = "装箱数据状态同步";
const R = require("ramda");

/** NodeJS服务端调用：
 *
 *   @database: { MES系统_生产环境 }
 *   @desc:     { 待同步未上传的数据列表 }
 */
const getCbpcPackageDataupload = (baseid = 1) =>
  axios({
    url: "/1233/c40205b59a.json",
    params: {
      baseid,
    },
  });

/**
 *   @database: { 检封装箱系统 }
 *   @desc:     { 指定品种冠字装箱数据采集情况 }
 */
const getQaPacketMaster = (params) =>
  axios({
    url: "/1232/eef189df21.json",
    params,
  });
/**
*   @database: { MES系统_生产环境 }
*   @desc:     { 更新数据上传情况 } 
  以下参数在建立过程中与系统保留字段冲突，已自动替换:
  @id:_id. 参数说明：api 索引序号 
*/
const setCbpcPackageDataupload = (params) =>
  axios({
    url: "/1234/737b938c0a.json",
    params,
  }).then(({ data: [{ affected_rows }] }) => affected_rows > 0);

const handleTaskItem = async ({ id: _id, ...param }) => {
  let res = await getQaPacketMaster(param);
  if (res.rows === 0) {
    return;
  }
  let box_num = res.data[0].num;
  await setCbpcPackageDataupload({
    _id,
    box_num,
  });
  // 更新数据
};

const getTaskList = async (id) => {
  const res = await getCbpcPackageDataupload(id);

  if (res.rows === 0) {
    console.info(`${task_name} 当前无新任务`);
    return false;
  }

  for (let i = 0; i < res.rows; i++) {
    if (i % 10 == 0) {
      console.log(`${id}:${task_name}:${i + 1}/${res.rows}`);
    }
    await handleTaskItem(res.data[i]);
  }

  const lastItem = R.last(res.data);

  return lastItem.id;
};

// 35925,此前的数据
const init = async () => {
  let isComplete = false;
  let lastId = 50000;
  // 不断循环
  while (!isComplete) {
    let res = await getTaskList(lastId);
    console.log(res);
    if (!res) {
      isComplete = true;
    } else {
      lastId = res;
    }
  }
  console.info(`${task_name} 数据处理完成`);
};

/**
 * 获取任务列表
 with src as( SELECT
  a.CarNumber cart,
  dbo.fnCBPC_cart_prod ( a.carnumber ) AS prod,
  (
  CASE
    	
      WHEN len( a.crownword ) = 5 THEN
      a.crownword 
      WHEN SUBSTRING ( a.crownword, 4, 1 ) = '*' THEN
      (
      CASE
        	
          WHEN SUBSTRING ( a.crownword, 3, 1 ) = '*' THEN
          LEFT ( a.crownword, 2 ) ELSE LEFT ( a.crownword, 3 ) 
        END 
        ) ELSE a.crownword 
      END 
      ) AS gz,
      dbo.fnCBPC_GetLeddingNum ( CrownWordStartNum ) gz_num  ,starttime end_time
    	
    FROM
      dbo.udt_pp_MachineProcess a 
    WHERE
      a.targetprocess= 24 
      AND LEFT ( starttime, 4 ) = '2021' 
      AND crownwordstartnum IS NOT NULL 
      AND SUBSTRING ( CarNumber, 3, 2 ) <> '10' 
 ) insert into tbl_cbpc_package_dataupload(cart,prod,gz,gz_num,end_time) select * from src

 */

/** check
 SELECT
 id,
 a.cart 车号,
 a.prod 品种,
 a.gz+ a.gz_num 冠字,
 a.box_num 数据量,
 a.end_time 装箱日期
 ,
 ( CASE WHEN a.box_num IS NULL THEN '缺失' ELSE '数据不完整' END ) 
 FROM
   dbo.tbl_cbpc_package_dataupload AS a 
 WHERE
   a.box_num IS NULL 
   OR ( a.box_num <340 ) 
   -- AND prod not IN ( '9602T', '9603T' )  
ORDER BY
 a.end_time ASC
 */
module.exports = { init };
