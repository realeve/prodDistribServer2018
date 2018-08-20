let { axios } = require("./axios");
let http = require("axios");

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统_图像库 }
 *   @desc:     { 码后核查严重废锁定图像未判废列表 } 
 */
module.exports.getSeriousImg = async() => await axios({
    url: '/176/ceb0dc2230/array.json'
}).then(res => res);

/** NodeJS服务端调用：
*
*   @database: { 全幅面 }
*   @desc:     { 严重废锁图码后核查判废情况 } 
    const { cart, images } = params;
*/
module.exports.getQfmWipJobs = async params => await axios({
    url: '/175/e30c188fbd.json',
    params,
}).then(res => res);

/** NodeJS服务端调用：
*
*   @database: { 质量信息系统_图像库 }
*   @desc:     { 更新码后核查严重废锁定图像判废结果 } 
    const { status, cart, img_id } = params;
*/
module.exports.setSeriousImg = async params => await axios({
    method: 'post',
    data: {
        ...params,
        id: 177,
        nonce: 'd08b605030'
    },
}).then(res => res);