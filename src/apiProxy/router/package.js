const R = require('ramda');
const { dev } = require('../../util/axios');
const db = require('./db_package');

// 每包开包量小于10时，分配完毕
const endNum = 5;

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
    let dataWithOpennum = await getOpenNum(unlockData);

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
    return R.compose(R.flatten, R.map(
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
    // 计算基础信息:期望包数
    setting = getTaskBaseInfo({ carts, setting });

    // 分配任务
    let res = distribCarts({ setting, carts, ascend: false })
    return setting;
}

// 汇总列数据
const calcTotalData = (key, data) =>
    R.compose(
        R.reduce(R.add, 0),
        R.map(R.prop(key))
    )(data);

// 汇总任务数汇总
const getTaskBaseInfo = ({ setting, carts }) => {
    // 汇总开包量总数
    let totalOpennum = calcTotalData('opennum', carts);
    // 汇总车号
    let totalCartsNum = calcTotalData('num', setting);
    if (totalCartsNum == 0) {
        return [];
    }
    // 每单位开包量
    let openNumPerUnit = totalOpennum / totalCartsNum;
    return R.clone(setting).map((item) => {
        item = Object.assign(item, {
            expect_num: parseInt(item.num * openNumPerUnit),
            expect_carts: item.num,
            real_num: 0,
            carts_num: 0,
            delta_num: 0,
            data: [],
            success: false
        });
        return item;
    });
};

// 首次分配任务
const distribCarts = ({ setting, carts, ascend }) => {
    if (carts.length == 0) {
        return { setting, carts };
    }
    // 对carts排序
    if (ascend) {
        carts = R.sort(R.ascend(R.prop('opennum')))(carts);
    } else {
        carts = R.sort(R.descend(R.prop('opennum')))(carts);
    }

    // 用户信息更新
    setting = R.map((curMachine) => {
        // 如果该万已经被分配，继续
        if (curMachine.success || carts.length == 0) {
            return curMachine;
        }
        // 取第一项数据
        let head = R.head(carts);

        // 待排活数据删除一项
        carts = R.tail(carts);
        let { real_num, expect_num, carts_num, num: expect_carts } = curMachine;
        // 更新当前状态
        real_num = real_num + head.opennum;
        carts_num = carts_num + 1;
        let delta_num = real_num - expect_num;
        let data = [...curMachine.data, head];
        let finished = Math.abs(delta_num) <= endNum;

        // 超过指定万数时，当前任务停止排活
        let success = carts_num === expect_carts;
        return Object.assign(curMachine, {
            real_num,
            carts_num,
            delta_num,
            data,
            success,
            finished
        });
    })(setting);

    return distribCarts({
        setting,
        carts,
        ascend: !ascend
    });
};

module.exports.dev = dev;
module.exports.init = init;