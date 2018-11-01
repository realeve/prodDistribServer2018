let db = require('../util/db_sync_manualCheck');
let R = require('ramda');

let task_name = '同步人工判废信息';
const init = async() => {
    mahou();
};

// 码后核查判废数据同步
const mahou = async() => {
    let { data: taskList } = await db.getMahoudata();
    for (let i = 0; i < taskList.length; i++) {
        console.log(`${task_name}:${i + 1}/${taskList.length}`);
        await handleMahouTask(taskList[i]);
        console.log(`码后：${i + 1}/${taskList.length} 同步完成`);
    }
}

const handleMahouTask = async({ id, cart_number: cart, date_diff }) => {
    // 判废结果
    let { data: [verify] } = await db.getQfmQaTempQatbl({ cart, cart2: cart });

    if (R.isNil(verify)) {
        console.log(cart + '读取判废信息失败.');
        return;
    }
    // 号码开包量
    let {
        data: [code]
    } = await db.getWipJobs(cart);

    // 丝印开包量,增加丝印黑图分析，未完成。20181031
    let {
        data: [siyin]
    } = await db.getWipJobsSiyin({ cart, cart2: cart });

    if (R.isNil(siyin)) {
        siyin = {
            opennum: 0,
            real_fake: 0,
            check_black_img: 0,
            machine_black_img: 0
        };
    }

    let {
        product_name: producttypename,
        start_date: producetime,
        verify_date: verifytime,
        operator_name: verifyoperatorname,
        err_count: totalcount,
        real_paper_num: vbigpiececount,
        real_kai_num: vkaicount,
        real_pic_num: vrealtotalcount,
        pm_opennum: opennum,
        black_img_print
    } = verify;

    let appendData = {
        opennum_code: code.opennum || 0,
        realfake_code: code.real_fake || 0,
        opennum_siyin: siyin.opennum,
        realfake_siyin: siyin.real_fake,
        black_img_code: code.black_img_code || 0,
        black_img_siyin_check: siyin.check_black_img || 0,
        black_img_siyin_machine: siyin.machine_black_img || 0
    };

    let params = {
        ...appendData,
        _id,
        producttypename,
        producetime,
        verifytime,
        verifyoperatorname,
        totalcount,
        vbigpiececount,
        vkaicount,
        vrealtotalcount,
        opennum,
        black_img_print, // 票面黑图
    };
    console.log(params);

    // 插入人工判废结果
    let {
        data: [{ affected_rows }]
    } = await db.addManualverifydata(params);
    if (affected_rows == 0) {
        console.log(cart + '判废结果回写失败.');
        return;
    }
    console.log(id, '更新完成')
        // 更新任务状态
    await db.setMahoudata(id);
};


// 码后核查历史判废数据同步
const updateHisData = async() => {
    let { data: taskList } = await db.getManualverifydata();

    for (let i = 0; i < taskList.length; i++) {
        console.log(`${task_name}:${i + 1}/${taskList.length}`);
        await updateTask(taskList[i]);
        console.log(`${i + 1}/${taskList.length} 同步完成`);
    }
};

const updateTask = async({ id: _id, cart }) => {
    // 判废结果 
    let { data: [verify] } = await db.getQfmWipJobsUpdate(cart);
    if (R.isNil(verify)) {
        console.log(cart + '读取判废信息失败.');
        return;
    }
    let {
        black_img_print
    } = verify;

    // 号码开包量
    let {
        data: [code]
    } = await db.getWipJobsCode(cart);

    // 丝印开包量,增加丝印黑图分析，未完成。20181031
    let {
        data: [siyin]
    } = await db.getWipJobsSiyinUpdate(cart);

    if (R.isNil(siyin)) {
        siyin = {
            check_black_img: 0,
            machine_black_img: 0
        };
    }

    let appendData = {
        black_img_code: code.black_img_code || 0,
        black_img_siyin_check: siyin.check_black_img || 0,
        black_img_siyin_machine: siyin.machine_black_img || 0
    };

    let params = {
        ...appendData,
        _id,
        black_img_print
    };

    // 插入人工判废结果
    let {
        data: [{ affected_rows }]
    } = await db.setManualverifydataBlackimg(params);
    if (affected_rows == 0) {
        console.log(cart + '判废结果回写失败.');
        return;
    }
};


module.exports = { init, updateHisData };