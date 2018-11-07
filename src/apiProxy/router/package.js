const R = require('ramda');
const { dev } = require('../../util/axios');
const db = require('./db_package');

const getCartList = R.compose(R.flatten, R.map(R.prop('carno')));

const init = async({ tstart, tend }) => {
    let { data } = await db.getVwWimWhitelist();
    data = data.map(({ gh, prodname, carno, idx, lock_reason }) => {
        idx = parseInt(idx, 10);
        return {
            gh,
            prodname,
            carno,
            idx,
            lock_reason
        }
    });
    // 未锁车车号列表
    let unlockData = R.filter(({ lock_reason }) => R.isNil(lock_reason))(data);

    let cartList = getCartList(unlockData);

    let completeCarts = await getVerifyStatus(cartList);

    // 图核判废完成品
    let verifiedCarts = R.filter(({ carno }) => completeCarts.includes(carno))(unlockData);

    // 从后台读取任务设置信息
    let machineSetting = require('../mock/package_machine_setting');
    machineSetting = handleMachineSetting(machineSetting);

    let setting = getProdNum(machineSetting);

    // 截取指定数量的车号
    unlockData = getValidCarts(verifiedCarts, setting);

    // 待判废车号开包量
    let dataWithOpennum = getOpenNum(unlockData);

    // 排活
    let res = prodistCarts(dataWithOpennum, machineSetting);
    return res;
}
const handleMachineSetting = machineSetting => {
    machineSetting = R.map(item => {
        item.num = parseInt(item.num, 10);
        return item;
    })(machineSetting);

    return R.groupBy(R.prop('prod_name'))(machineSetting);
}
const getProdNum = machineSetting => {
    return R.compose(R.map(prodname => {
        let nums = R.compose(R.flatten, R.map(R.prop('num')))(machineSetting[prodname]);
        let num = R.reduce(R.add, 0)(nums);
        return {
            prodname,
            num
        }
    }), R.keys)(machineSetting);
}

// 获取每个品种指定的大万数
const getValidCarts = (carts, setting) => {
    carts = R.groupBy(R.prop('prodname'))(carts);
    let res = [];
    setting.forEach(({ prodname, num }) => {
        let curData = carts[prodname];
        if (!R.isNil(curData)) {
            curData = R.slice(0, num)(curData);
            res = [...res, ...curData]
        }
    })
    return res;
}

// 车号列表判废状态
const getVerifyStatus = async carts => {
    // 获取车号判废状态结果，确保所有产品已执行完图像判废；
    return carts;
}

// 单万产品开包量
const getOpenNumByCart = cart => {
    return parseInt(Math.random() * 100 + 50);
}

// 批量获取开包量
const getOpenNum = async carts => {
    // 车号列表
    let cart = getCartList(carts);
    // 从服务端获取开包量信息

    // 模拟获取对应车号开包量信息
    carts = carts.map(item => {
        item.opennum = getOpenNumByCart();
        return item;
    })
    return carts;
}

// 任务分配
const prodistCarts = (carts, setting) => {
    R.compose(R.map(
        prodname => {
            let cartList = R.filter(R.propEq('prodname', prodname))(carts)
            return prodistCartByProd(cartList, setting[prodname])
        }
    ), R.keys)(setting)
}

/**
 * 根据品种分配任务
 * carts:车号列表，仅包含单一品种
 * setting:对应该品种需要分配到几个班次
 */
const prodistCartByProd = (carts, setting) => {

}

module.exports.dev = dev;
module.exports.init = init;