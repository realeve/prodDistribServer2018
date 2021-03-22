const { axios, dev } = require("../../util/axios");
const R = require("ramda");

/** NodeJS服务端调用：
*
*   @database: { 机台作业 }
*   @desc:     { 图像判废每日待判车号列表 } 
    const { tstart, tend } = params;
*/
module.exports.getViewCartfinder = (params) =>
  dev
    ? require("../mock/cartlist.json")
    : axios({
        url: "/185/68f8afe278.json",
        params,
      });

/**
*   @database: { MES_MAIN }
*   @desc:     { 图像判废每日待判车号列表(丝印印刷完毕判废) } 
    const { tstart, tend } = params;
*/
module.exports.getVCbpcCartlist = (params) =>
  axios({
    url: "/344/a8ea958d2b.json",
    params,
  });
/**
  *   @database: { MES_MAIN }
  *   @desc:     { 图核指定品种每日待判车号列表(丝印印刷后判废) } 
      const { tstart, tend, prod } = params;
  */
module.exports.getVCbpcCartlistByProd = (params) =>
  axios({
    url: "/345/b78e6ce4d7.json",
    params,
  });

/** NodeJS服务端调用：
*
*   @database: { 机台作业 }
*   @desc:     { 图像判废每日指定品种待判车号列表 } 
    const { tstart, tend, prod } = params;
*/
module.exports.getViewCartfinderByProd = (params) =>
  axios({
    url: "/234/651c80b3b9.json",
    params,
  });

/**
*   @database: { 小张核查 }
*   @desc:     { 小张核查_图像判废月度产量汇总 } 
    const { tstart, tend, tstart2, tend2 } = params;
*/
// const getWipProdLogs = (params) =>
//   axios({
//     url: '/383/7f95a2c2a7.json',
//     params
//   });

/**
*   @database: { 全幅面 }
*   @desc:     { 图像判废月度产量汇总 } 
    const { tstart, tend } = params;
*/
module.exports.getQfmWipProdLogs = async (
  params //{
) =>
  dev
    ? require("../mock/pfnum_month.js")
    : await axios({
        url: "/186/9a8e4c9d74/5.json",
        params,
      }).then(({ data }) =>
        data.map((item) => {
          item.cart_nums = parseInt(item.cart_nums, 10);
          item.pf_num = parseInt(item.pf_num, 10);
          item.check_num = parseInt(item.check_num, 10);
          item.total_num = parseInt(item.total_num, 10);
          return item;
        })
      );
//   let res2 = await getWipProdLogs(params).then(({ data }) =>
//     data.map((item) => {
//       item.cart_nums = parseInt(item.cart_nums, 10);
//       item.pf_num = parseInt(item.pf_num, 10);
//       item.check_num = parseInt(item.check_num, 10);
//       item.total_num = parseInt(item.total_num, 10);
//       return item;
//     })
//   );

//   // 合并数据
//   res1 = [...res1, ...res2];
//   let res = R.groupBy(R.prop('operator_name'))(res1);
//   let res3 = Object.entries(res).map(([key, val]) => {
//     let dst = {
//       operator_name: key,
//       cart_nums: 0,
//       pf_num: 0,
//       check_num: 0,
//       total_num: 0
//     };
//     val.forEach((item) => {
//       dst.cart_nums += item.cart_nums;
//       dst.pf_num += item.pf_num;
//       dst.check_num += item.check_num;
//       dst.total_num += item.total_num;
//     });
//     return dst;
//   });

//   return res3;
// };

/** NodeJS服务端调用：
*
*   @database: { 全幅面 }
*   @desc:     { 指定车号列表判废条数查询 } 
    const { carts0, carts1,carts2 } = params;
*/
module.exports.getWipJobs = async (params) =>
  dev
    ? require("../mock/pfnum.json")
    : await axios({
        method: "post",
        data: {
          ...params,
          id: 195,
          nonce: "544a395fd4",
        },
      }).then(({ data }) => {
        // console.log(params.carts0.concat("','"));
        // console.log(params.carts1.concat("','"));
        return data.map((item) => {
          item.pf_num = parseInt(item.pf_num, 10);
          item.type = parseInt(item.type, 10);
          item.finished_flag = parseInt(item.finished_flag, 10);
          return item;
        });
      });
// .catch((e) => {
//   console.log(e);
// });
