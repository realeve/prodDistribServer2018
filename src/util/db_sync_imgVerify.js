let { axios, dev } = require('./axios');

/**
 *   @database: { 质量信息系统 }
 *   @desc:     { 人工图像判废结果同步列表 } 
 */
module.exports.getMahoudata = () => axios({
    url: '/219/e6e7b0b7db.json'
});


/**
 *   @database: { 机台作业 }
 *   @desc:     { 指定车号列表中全检品 } 
 */
module.exports.getViewCartfinder = carts => axios({
    method: 'post',
    data: {
        carts,
        id: 210,
        nonce: 'bb0c2704f1'
    },
});

/** NodeJS服务端调用：
*
*   @database: { 全幅面 }
*   @desc:     { 人工图像判废结果 } 
    const { cart_number, imgs } = params;
*/
module.exports.getQfmQaInspectSlave = params => axios({
    url: '/220/d2f6b260c7.json',
    params,
});


/** NodeJS服务端调用：
*
*   @database: { 质量信息系统 }
*   @desc:     { 回写判废结果 } 
    const { img1, img2, img3, cart_number } = params;
*/
module.exports.setMahoudata = params => axios({
    url: '/221/1f1e612dc9.json',
    params,
});

/** NodeJS服务端调用：
 *
 *   @database: { 质量信息系统 }
 *   @desc:     { 人工图像判废标志回写 } 
 */
module.exports.setMahoudataStatus = cart => axios({
    url: '/222/6a086832a6.json',
    params: {
        cart
    },
});