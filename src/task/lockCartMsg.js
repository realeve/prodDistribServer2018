let db = require("../util/db");
let R = require("ramda");
let rtxList = require('../util/rtx/index');

// const consola = require("consola");
const procHandler = require("../util/procHandler");

let task_name = "锁车产品消息推送";
const init = async() => {
    console.log("开始任务：" + task_name);
    let { data } = await db.getCartsNeedPush();
    if (R.isNil(data) || data.length === 0) {
        console.info("所有任务处理完毕，下个周期继续");
        return;
    }
    // 锁车状态处理
    let carts = R.map(R.prop('cart_number'))(data);
    let result = await db.getTbbaseCarTechnologyHistory(carts);
    // 分离出锁车状态的产品用于推送消息 ，其余产品更新状态
    let lockCarts = R.filter(R.propEq(5, '锁定'))(result.data);
    console.log('以下车号列表处于锁定状态：');
    console.log(lockCarts);

    let completedCarts = R.difference(carts, lockCarts);

    if (completedCarts.length) {
        db.unlockCartsBySys({
            remark: '消息推送进程自动解锁完工产品',
            carts: completedCarts
        })
    }

    // 全部推送完毕，则停止提醒。
    if (lockCarts.length == 0) {
        console.log('所有产品均已完工，停止执行推送。')
        return;
    }

    // 处理未完工产品，推送消息
    let lockCartsInfo = R.filter(({ cart_number }) => R.contains(cart_number, lockCarts))(data);
    let userList = R.groupBy(item => item.user_name, lockCartsInfo);

    let users = Object.keys(userList);
    users.forEach(async user => {
        // 获取该用户的 rtx UID
        // getuid
        let rtxInfo = R.find(R.propEq('username', user))(rtxList);
        if (typeof rtxInfo == 'undefined') {
            console.log('用户' + user + 'RTX信息查找失败');
            return;
        }
        console.log(rtxInfo);
        // 推送消息内容
        const push_carts = R.map(R.prop('cart_number'))(userList[user]);
        let cart_str = push_carts.join(',');
        // 推送消息 
        let { status } = await db.pushRTXInfo({
                title: '锁车产品信息推送',
                msg: `您所锁定的产品${cart_str}已到设定解锁日期，请([点击此处|http://10.8.2.133:92/locklist])及时解锁。`,
                receiver: rtxInfo.rtxuid
            })
            // 更新当日推送状态
        if (status == 200) {
            db.updatePushTime(push_carts);
        }
    })
};

module.exports = { init };