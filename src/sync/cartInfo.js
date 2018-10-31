let db = require('../util/db_sync_cartinfo');
let R = require('ramda');

let task_name = '同步机台生产信息';
const init = async() => {
    await siyin();
    await mahou();
};

// 丝印生产信息同步
const siyin = async() => {
    let { data: taskList } = await db.getSiyindata();
    for (let i = 0; i < taskList.length; i++) {
        console.log(`${task_name}:${i + 1}/${taskList.length}`);
        await handleSiyinTask(taskList[i]);
        console.log(`丝印：${i + 1}/${taskList.length} 同步完成`);
    }
    return true;
}

const handleSiyinTask = async({ id, cart_number: cart }) => {
    // 生产信息
    let { data } = await db.getTbjtProduceDetail(cart);
    if (data.length === 0) {
        console.log(`${cart}无生产信息`);
        return;
    }
    // console.log(data);
    let carts = R.map(item => {
        item.siyinid = id;
        return item;
    })(data)

    let {
        data: [{ affected_rows }]
    } = await db.addCartinfodataSiyin(carts);

    if (affected_rows == 0) {
        console.log(cart + '生产信息写入失败.');
        return;
    }
    console.log(id, '更新完成')

    // 更新任务状态
    await db.setSiyindata(id);
};


// 码后生产信息同步
const mahou = async() => {
    let { data: taskList } = await db.getMahoudata();

    for (let i = 0; i < taskList.length; i++) {
        console.log(`${task_name}:${i + 1}/${taskList.length}`);
        await handleMahouTask(taskList[i]);
        console.log(`码后：${i + 1}/${taskList.length} 同步完成`);
    }
    return true;
}

const handleMahouTask = async({ id, cart_number: cart }) => {
    // 生产信息
    let { data } = await db.getTbjtProduceDetail(cart);
    if (data.length === 0) {
        console.log(`${cart}无生产信息`);
        return;
    }
    // console.log(data);
    let carts = R.map(item => {
        item.mahouid = id;
        return item;
    })(data)

    let {
        data: [{ affected_rows }]
    } = await db.addCartinfodataMahou(carts);

    if (affected_rows == 0) {
        console.log(cart + '生产信息写入失败.');
        return;
    }
    console.log(id, '更新完成')

    // 更新任务状态
    await db.setMahoudata(id);
};


module.exports = { init };