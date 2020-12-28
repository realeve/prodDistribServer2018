let { axios } = require("../util/axios");

const getUdtCwCrownwordcontainernonoticed = () =>
  axios({
    url: "/1195/0b7fbf18de.json",
  });

/**
 *   @database: { MES系统_生产环境 }
 *   @desc:     { 指定冠字完工量汇总 }
 */
const getUdtPpMachineprocess = ({ crown, prod_id, start_num, end_num }) =>
  axios({
    url: "/1194/52f31e6021.json",
    params: {
      crown,
      prod_id,
      start_num,
      end_num,
    },
  });

/**
*   @database: { MES系统_生产环境 }
*   @desc:     { 更新冠字产量完工情况 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@id:_id. 参数说明：api 索引序号 
*/
const setUdtCwCrownwordcontainernonoticed = ({
  num_code,
  num_cover,
  num_check,
  num_package,
  _id,
}) =>
  axios({
    url: "/1196/556b405f9e.json",
    params: {
      num_code,
      num_cover,
      num_check,
      num_package,
      _id,
    },
  }).then(({ data: [{ affected_rows }] }) => affected_rows > 0);

/**
 ******************  数据库定义完成   **********************
 */

let task_name = "同步各冠字产量信息";

const init = async () => {
  let { data: taskList } = await getUdtCwCrownwordcontainernonoticed();
  if (taskList.length == 0) {
    console.log("当前无" + task_name + "信息同步");
    return true;
  }
  let len = taskList.length;
  for (let i = 0; i < len; i++) {
    console.log(`${task_name}:${i + 1}/${taskList.length}`);
    await handleTask(taskList[i]);
    console.log(`冠字产量：${i + 1}/${taskList.length} 同步完成`);
  }
  return true;
};

const handleTask = async ({
  CrownNo: crown,
  productid: prod_id,
  StartNumeric: start_num,
  EndNumeric: end_num,
  id,
}) => {
  // 查询生产信息
  let { data } = await getUdtPpMachineprocess({
    crown,
    prod_id,
    start_num,
    end_num,
  });
  if (data.length == 0) {
    return false;
  }
  let res = data[0];
  res._id = id;
  if(!res.num_code){
      console.log(crown,prod_id,id)
      return false;
  }
  return await setUdtCwCrownwordcontainernonoticed(res);
};
module.exports = { init };
