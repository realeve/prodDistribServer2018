let db = require('../util/db_sync_imgVerify');
let R = require('ramda');

let task_name = '同步码后核查特征图像判废结果';

const init = async() => {
    let { data: taskList } = await db.getMahoudata();

    for (let i = 0; i < taskList.length; i++) {
        console.log(`${task_name}:${i + 1}/${taskList.length}`);
        await handleMahouTask(taskList[i]);
        console.log(`码后：${i + 1}/${taskList.length} 同步完成`);
    }
    return true;
}

const handleMahouTask = async({ img1: _img1, img2: _img2, img3: _img3, cart: cart_number }) => {
    // 生产信息
    // 20181031 后端调整，增加支持请求参数有数组及其它数据类型的情况
    let { data } = await db.getQfmQaInspectSlave({
        cart_number,
        imgs: [_img1, _img2, _img3]
    });

    if (data.length === 0) {
        console.log(`${cart_number}无判废信息`);
        return;
    }

    let img1 = -1,
        img2 = -1,
        img3 = -1;
    data.forEach(({ image_index, item_flag }) => {
        if (image_index == _img1) {
            img1 = item_flag;
        } else if (image_index == _img2) {
            img2 = item_flag;
        } else if (image_index == _img3) {
            img3 = item_flag;
        }
    })

    let {
        data: [{ affected_rows }]
    } = await db.setMahoudata({
        cart_number,
        img1,
        img2,
        img3
    });

    if (affected_rows == 0) {
        console.log(cart + '生产信息写入失败.');
        return;
    }
    console.log(cart_number, '更新完成')

    // 更新任务状态
    await db.setMahoudataStatus(cart_number);
};


module.exports = { init };