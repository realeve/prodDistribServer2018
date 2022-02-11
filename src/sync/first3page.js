
let lib = require('../util/lib');

let task_name = "丝印前三张印刷产品缺陷情况";

let { axios } = require('../util/axios');

/** NodeJS服务端调用：
*
 *   @database: { 小张核查 }
 *   @desc:     { 待更新车号列表 } 
 */
const getTblCbpcFirst3page = () => axios({
    url: '/1457/cec138feb8.json',
}).then(res => res.data)

const getWipJobs = cart =>
    axios({
        url: '/1456/bc451f391d.json',
        params: {
            cart
        },
    }).then(res => res.data)
/**
 *   @database: { 小张核查 }
 *   @desc:     { 数据写入 }  
 */
const addCbpcFirst3page = params => axios({
    url: '/1458/4cbe504290.json',
    params,
})

const handleOneCart = async (cart) => {
    let data = await getWipJobs(cart)
    if (data.length == 0) {
        return;
    }
    let res = data[0]
    return await addCbpcFirst3page(res)
}

const start = async () => {
    let data = await getTblCbpcFirst3page()
    if (data.length === 0) {
        console.info('所有任务处理完毕，下个周期继续');
        return 0;
    }
    for (let i = 0; i < data.length; i++) {
        await handleOneCart(data[i].CART_NUMBER)
        if (i % 10 == 0) {
            console.log(`${i}/${data.length} complete`)
        }
    }
    return data.length
}

const init = async () => {
    let success = true;
    let i = 0;
    while (success) {
        let status = await start();
        if (status == 0) {
            success = false
        }
        i += status;
        console.log(`${i} complete`)
    }

}

module.exports.init = init;