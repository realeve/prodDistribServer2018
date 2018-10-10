const { axios } = require("../../util/axios");
const R = require('ramda');
const dev = true;

/** NodeJS服务端调用：
*
*   @database: { 机台作业 }
*   @desc:     { 图像判废每日待判车号列表 } 
    const { tstart, tend } = params;
*/
const getViewCartfinder = async params => await axios({
    url: '/185/68f8afe278.json',
    params,
}).then(res => res);

/**
*   @database: { 全幅面 }
*   @desc:     { 图像判废月度产量汇总 } 
    const { tstart, tend } = params;
*/
const getQfmWipProdLogs = async params => await axios({
    url: '/186/9a8e4c9d74.json',
    params,
}).then(res => res);

module.exports.handleHechaTask = async({ tstart, tend }) => {
    let res;
    if (dev) {
        console.log('dev mode');
        res = require('../mock/cartlist.json');
    } else {
        res = await getViewCartfinder({ tstart, tend });
    }
    let { data } = res;

    let siyinCarts = [],
        codeCarts = [];

    // 需要统计的丝印品
    siyinCarts = R.compose(R.pluck('cart_number'), R.filter(R.propEq('proc_name', '全检品')))(data)
    codeCarts = R.compose(R.pluck('cart_number'), R.filter(R.propEq('proc_name', '码后核查')))(data)
    console.log('siyinCarts', siyinCarts);
    console.log('codeCarts', codeCarts);
}