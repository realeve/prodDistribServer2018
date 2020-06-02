let { axios, dev } = require("./axios");

const lib = require("./lib");

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 丝印机长信息同步列表 }
 */
module.exports.getSiyindata = () =>
  axios({
    url: "/212/fc2673bece.json",
  });

/**
 *   @database: { MES_MAIN }
 *   @desc:     { 生产信息同步查询 }
 */
const getVCbpcCartlist = (cart) =>
  axios({
    url: "/341/6ed5208ead.json",
    params: {
      cart,
    },
  });

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 批量涂布信息回写 } */
module.exports.addCartinfodataTubu = (values) =>
  axios({
    method: "post",
    data: {
      values,
      id: 1020,
      nonce: "447db06c3d",
    },
  });

/** NodeJS服务端调用：
 *
 *   @database: { 机台作业 }
 *   @desc:     { 生产信息同步查询 }
 */
module.exports.getTbjtProduceDetail = getVCbpcCartlist;
// async (cart) => {
//   // 机台作业系统
//   let resJTZY = await axios({
//     url: "/213/49bf0d2f04.json",
//     params: {
//       cart,
//     },
//   });

//   // MES系统
//   let resMES = await getVCbpcCartlist(cart);

//   return lib.concatMesAndJtzy(resJTZY, resMES);
// };

/** NodeJS服务端调用：
*
*   @database: { 质量信息系统 }
*   @desc:     { 批量丝印机长信息同步写入 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@desc:批量插入数据时，约定使用二维数组values参数，格式为[{siyinid,cartnumber,carnumber,gznumber,techtypename,procname,workclassname,machinename,captainname,teamname,monitorname,printnum,startdate,enddate,productname,workinfo }]，数组的每一项表示一条数据*/
module.exports.addCartinfodataSiyin = (values) =>
  axios({
    method: "post",
    data: {
      values,
      id: 214,
      nonce: "9d927bed0d",
    },
  });

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 丝印生产信息同步结果回写 }
 */
module.exports.setSiyindata = (_id) =>
  axios({
    url: "/215/75e3f42e39.json",
    params: {
      _id,
    },
  });

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 码后机长信息同步列表 }
 */
module.exports.getMahoudata = () =>
  axios({
    url: "/216/141435f4c6.json",
  });

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 批量码后生产信息同步结果回写 } */
module.exports.addCartinfodataMahou = (values) =>
  axios({
    method: "post",
    data: {
      values,
      id: 217,
      nonce: "8cd0114d8c",
    },
  });

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 码后生产信息同步结果回写 }
 */
module.exports.setMahoudata = (_id) =>
  axios({
    url: "/218/8a343942c8.json",
    params: {
      _id,
    },
  });
module.exports.setPrintTubuData = (_id) =>
  axios({
    url: "/1019/3202ced61c.json",
    params: {
      _id,
    },
  });

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 涂布生产信息同步列表 }
 */
module.exports.getPrintTubuData = () =>
  axios({
    url: "/1018/54ef986157.json",
  });
