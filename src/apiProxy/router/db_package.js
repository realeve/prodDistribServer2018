const { axios, dev } = require('../../util/axios');
const R = require('ramda');
/** NodeJS服务端调用：
 *
 *   @database: { 库管系统 }
 *   @desc:     { 码后核查在库产品查询 } 
 */
module.exports.getVwWimWhitelist = () => dev ? require('../mock/package_list') : axios({
    url: '/249/f15c70ab61.json'
});


/** NodeJS服务端调用：
 *
 *   @database: { 全幅面 }
 *   @desc:     { 码后核查判废完工车号列表 } 
 */
module.exports.getQfmWipJobs = carts => axios({
    url: '/250/b3d68925f6.array',
    params: {
        carts
    },
}).then(({ data }) => R.uniq(R.flatten(data)))

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 指定车号列表开包量查询 } 
 */
module.exports.getManualverifydata = carts => axios({
    url: '/251/43da90eb45.json',
    params: {
        carts
    },
}).then(({ data }) => R.map(item => {
    item.opennum = parseInt(item.opennum, 10);
    item.ex_opennum = parseInt(item.ex_opennum, 10);
    return item;
})(data))