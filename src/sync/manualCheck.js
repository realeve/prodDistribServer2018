let db = require('../util/db_sync_manualCheck');
let R = require('ramda');

let task_name = '同步人工判废信息';
const init = async () => {
  let { data: taskList } = await db.getMahoudata();

  for (let i = 0; i < taskList.length; i++) {
    console.log(`${task_name}:${i + 1}/${taskList.length}`);
    await handleTask(taskList[i]);
    console.log(`${i + 1}/${taskList.length} 同步完成`);
  }
};

const handleTask = async ({ id, cart_number: cart, date_diff }) => {
  // 判废结果

  let {
    data: [verify]
  } = await db.getQfmQaTempQatbl(cart);

  if (R.isNil(verify)) {
    console.log(cart + '读取判废信息失败，该万产品可能还未判废，稍后将重试.');
    if (parseInt(date_diff) > 20) {
      // 更新任务状态
      await db.setMahoudata(id);
    }
    return;
  }

  // 号码开包量
  let {
    data: [code]
  } = await db.getWipJobs(cart);

  // 丝印开包量
  let {
    data: [siyin]
  } = await db.getQaTempQatbl(cart);
  if (R.isNil(siyin)) {
    siyin = {
      opennum: 0,
      real_fake: 0
    };
  }

  let {
    cart_number: cartnumber,
    product_name: producttypename,
    start_date: producetime,
    verify_date: verifytime,
    operator_name: verifyoperatorname,
    err_count: totalcount,
    real_paper_num: vbigpiececount,
    real_kai_num: vkaicount,
    real_pic_num: vrealtotalcount,
    pm_opennum: opennum
  } = verify;

  let appendData = {
    opennum_code: code.opennum || 0,
    realfake_code: code.real_fake || 0,
    opennum_siyin: siyin.opennum,
    realfake_siyin: siyin.real_fake
  };
  let params = {
    ...appendData,
    mahouid: id,
    cartnumber,
    producttypename,
    producetime,
    verifytime,
    verifyoperatorname,
    totalcount,
    vbigpiececount,
    vkaicount,
    vrealtotalcount,
    opennum
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
  // 更新任务状态
  await db.setMahoudata(id);
};

const updateHisData = async () => {
  let { data: taskList } = await db.getManualverifydata();

  for (let i = 0; i < taskList.length; i++) {
    console.log(`${task_name}:${i + 1}/${taskList.length}`);
    await updateTask(taskList[i]);
    console.log(`${i + 1}/${taskList.length} 同步完成`);
  }
};

const updateTask = async ({ id: _id, cart_number: cart }) => {
  // 判废结果

  let {
    data: [verify]
  } = await db.getQfmQaTempQatbl(cart);

  if (R.isNil(verify)) {
    console.log(cart + '读取判废信息失败.');
    return;
  }

  // 号码开包量
  let {
    data: [code]
  } = await db.getWipJobs(cart);

  // 丝印开包量
  let {
    data: [siyin]
  } = await db.getQaTempQatbl(cart);
  if (R.isNil(siyin)) {
    siyin = {
      opennum: 0,
      real_fake: 0
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
    pm_opennum: opennum
  } = verify;

  let appendData = {
    opennum_code: code.opennum || 0,
    realfake_code: code.real_fake || 0,
    opennum_siyin: siyin.opennum,
    realfake_siyin: siyin.real_fake
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
    opennum
  };
  console.log(params);

  // 插入人工判废结果
  let {
    data: [{ affected_rows }]
  } = await db.setManualverifydata(params);
  if (affected_rows == 0) {
    console.log(cart + '判废结果回写失败.');
    return;
  }
};

module.exports = { init, updateHisData };
