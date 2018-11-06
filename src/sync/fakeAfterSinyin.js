let db = require('../util/db_sync_fakeAfterSiyin');
let R = require('ramda');

let task_name = '同步丝印实废';

/** 
 * 任务说明：同步丝印后工序产生的丝印实废
 * 2018-11-05 22：38 by 李宾
 * 
 * 通过比对码后丝印实废及丝印工序实废的号码及开位信息，分析由丝印后造成的实废数量；
 * 将开包量信息合并，生成实际的期望开包量以及由号码和丝印额外产生的开包量 
 *  */

const init = async() => {
    let { data: taskList } = await db.getManualverifydata();
    let allCheckData = await filterAllCheck(taskList);
    taskList = R.reject(item => allCheckData.includes(item.cart))(taskList);
    for (let i = 0; i < taskList.length; i++) {
        console.log(`${task_name}:${i + 1}/${taskList.length}`);
        let prod_id = taskList[i].cart.substr(2, 1);
        let finish = prod_id != '8' ? true : await isFinished(taskList[i]);
        if (finish) {
            await handleMahouTask(taskList[i]);
            console.log(`码后：${i + 1}/${taskList.length} 同步完成`);
        } else {
            console.log(`码后：${i + 1}/${taskList[i].cart} 判废未完成`);
        }
    }
};

const filterAllCheck = async tasks => {
    let carts = R.compose(R.flatten, R.map(R.prop('cart')))(tasks);
    let { data } = await db.getViewCartfinder(carts);
    let allCheckData = R.compose(R.flatten, R.map(R.prop('cart')))(data);

    // 更新状态
    await db.setManualverifydata(allCheckData);
    return allCheckData;
}

const isFinished = async({ cart }) => {
    let { rows } = await db.isVerifyComplete({ cart1: cart, cart2: cart });
    return rows >= 2;
};

// let data = [
//   { format_pos: '2', code_num: '0062', type: '0' },
//   { format_pos: '19', code_num: '0085', type: '1' },
//   { format_pos: '19', code_num: '0085', type: '0' },
//   { format_pos: '14', code_num: '0093', type: '1' },
//   { format_pos: '14', code_num: '0093', type: '0' },
// ];
const calcFakeInfo = (data) => {
    // 此时的数据已经去除了前后的黑图
    // 将开位和号码信息组合为键值
    data = data.map((item) => {
        let format_pos = item.format_pos.padStart(2, '0');
        let key = 'k' + format_pos + item.code_num;
        return {
            format_pos: key,
            type: parseInt(item.type, 10)
        };
    });

    // 对键值分组
    data = R.groupBy(R.prop('format_pos'))(data);

    // 哪些键值只有一项数据（只有码后或只有丝印有）
    let singleData = R.compose(
        R.filter((key) => data[key].length < 2),
        R.keys
    )(data);
    singleData = R.compose(
        R.flatten,
        R.props(singleData)
    )(data);
    let fake_not_in_mahou = R.compose(
            R.length,
            R.filter(R.propEq('type', 1))
        )(singleData),
        // 0表示码后有数据，即丝印无数据，丝印后产生的
        fake_after_siyin = R.compose(
            R.length,
            R.filter(R.propEq('type', 0))
        )(singleData);

    return {
        fake_after_siyin,
        fake_not_in_mahou
    };
};

const handleOpenNum = async cart1 => {
    let { data: hecha } = await db.getQaRectifyMaster({ cart1, cart2: cart1 });
    let { data: code } = await db.getWipJobs(cart1);
    hecha = hecha.map(({ format_pos, kilo_num, type }) => ({
        format_pos: format_pos + '_' + kilo_num,
        type: parseInt(type)
    }));
    code = code.map(({ format_pos, kilo_num, type }) => ({
        format_pos: format_pos + '_' + kilo_num,
        type: parseInt(type)
    }))
    R.reject(item => hecha.includes(h => h.format_pos === item.format_pos))(code);
    let combineData = [...hecha, ...code];
    // 期望总开包量
    let ex_opennum = combineData.length;
    // 由丝印额外造成的开包量
    let ex_siyin_opennum = combineData.filter(item => item.type == 1).length;
    // 由号码额外造成的开包量
    let ex_code_opennum = combineData.filter(item => item.type == 2).length;
    return {
        ex_opennum,
        ex_siyin_opennum,
        ex_code_opennum
    }
}

const handleMahouTask = async({ id, cart }) => {
    // 判废结果
    let { data } = await db.getQaRectifyMaster({ cart1: cart, cart2: cart });
    let updateData1 = calcFakeInfo(data);
    let updateData2 = await handleOpenNum(cart);
    let params = {
            ...updateData1,
            ...updateData2,
            _id: id
        }
        // 待更新的信息

    let {
        data: [{ affected_rows }]
    } = await db.setManualverifydata(params);
    if (affected_rows == 0) {
        console.log(cart + '判废结果回写失败.');
        return;
    }
    console.log(id, '更新完成');
};

module.exports = { init };