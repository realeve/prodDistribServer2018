let { axios } = require("../util/axios");
let task_name = "AI判废 OCR数据处理";
const R = require("ramda");

const getCarts = () => axios({
    url: '/1473/74867103a0.json',
}).then(res => res.data)

const isUpload =
    cart => axios({
        url: '/1475/77daf615ae.json',
        params: {
            cart
        },
    }).then(res => res.rows > 0)

const getOcrContrastResult =
    cart => axios({
        url: '/1474/1800e773c4.json',
        params: {
            cart
        },
    }).then(res => R.flatten(res.data.map(item => item.code)))

const setDetail = params => axios({
    url: '/1476/11934992c1.json',
    params
}).then(({
    data: [{
        affected_rows
    }]
}) => affected_rows > 0).catch(e => {
    console.log(e)
    return false
})

const setCarts = cart_id =>
    axios({
        url: '/1477/6486a1d9f1.json',
        params: {
            cart_id
        },
    }).then(({
        data: [{
            affected_rows
        }]
    }) => affected_rows > 0);

const handleItem = async item => {
    console.log(item)
    let uploaded = await isUpload(item.cart);
    if (!uploaded) {
        console.log(`${item.cart} 未上传`);
        return;
    }
    let code = await getOcrContrastResult(item.cart)

    if (code.length > 0) {
        await setDetail({
            code, cart_id: item.id
        })
    }
    await setCarts(item.id)
}

const init = async () => {
    let carts = await getCarts()
    for (let i = 0; i < carts.length; i++) {
        await handleItem(carts[i])
        console.log(`${task_name} ${i + 1}/${carts.length} complete`)
    }
}


module.exports = { init };
