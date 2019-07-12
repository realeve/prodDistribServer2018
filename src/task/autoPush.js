let R = require('ramda');
let db = require('../util/db');
let lib = require('../util/lib');
let rtxList = require('../util/rtx/index');
const moment = require('moment');
const { axios, mock, _commonData, DEV } = require('../util/axios');
moment.locale('zh-cn');
let task_name = '机台作业日志自动分析消息推送';

// let DEV = true;

// 是否是白班
const isWorkTime = (testHour) => {
  let curHour = testHour || parseInt(moment().format('HHMM'), 10);
  return curHour >= 600 && curHour <= 830;
};

const getWeekEnd = (weekDayName) => {
  let weekDay = weekDayName || moment().format('dddd');
  return !['星期六', '星期日', 'Sunday', 'Saturday'].includes(weekDay);
};

const prepare = async () => {
  console.log('开始任务：' + task_name);
  if (!isWorkTime()) {
    console.info(`${task_name}:不在指定时间段，暂不推送`);
    return false;
  }
  if (!getWeekEnd()) {
    console.info(`${task_name}:周末暂不推送`);
    return false;
  }

  let res = await getTblArticle();
  if (res.rows > 0) {
    console.info(`${task_name}:今日已发布`);
    return false;
  }
  return res;
};
const init = async () => {
  let shouldPublish = await prepare();
  if (!shouldPublish) {
    return false;
  }
  console.log('开始分析文章');
  // 关闭最近一期文章状态
  await setArticle();

  // 生成文章
  let msg = await getHtml();
  // console.log(msg);
  // return;
  // 发文章
  let res = await publishArticle(msg);
  if (!res.success) {
    console.error('文章发送失败');
    return;
  }

  let { status } = await db.pushRTXInfo({
    title: '工艺质量交互平台',
    msg: `今日(${lib.now()})机台生产作业信息分析记录已发布，请([点击此处|http://10.8.2.133:90/view/${
      res.id
    }])阅读。`,
    receiver: res.receiver
  });
  console.log('文章发送成功');
  return status;
};

const getUserList = (users) => {
  let userList = [];
  users.split(',').forEach((user) => {
    let res = rtxList.find((u) => u.username == user);
    if (res) {
      userList.push(res.rtxuid);
    }
  });
  return userList.join(',');
};

// 发文章
const publishArticle = async (content) => {
  let pubstatus = await prepare();
  if (!pubstatus) {
    return { success: false };
  }
  let operator =
    '武明凯,赵立军,张宪,王昌明,朱江,袁长虹,黄莉,徐东海,陈文革,钟鸣,舒粤,杨畅,李丹,周海兵,吕从飞,王晓,高阳阳,陈嘉骢,刘建佳';
  let cate_id = 20; //机台换修记录
  let uid = 248; //消息机器人
  let title = `${moment().format('MM月DD日')} 印刷材料更换及设备维修记录`;
  let receiver = getUserList(
    operator +
      ',李宾,蒲明玥,李超群,马可,张立力,潘成,朱振华,胡新玥,杨林,冯诗伟,任礼科,蒋荣'
  );
  let params = {
    uid,
    rec_time: lib.now(),
    attach_list: '',
    prod: '',
    proc: '',
    machine: '',
    operator,
    cartno: '',
    cate_id,
    content,
    title,
    receiver,
    remark: '',
    reward: '',
    reward_status: '',
    reward_user: '',
    status_username: '',
    sys_id: 0,
    notice_id: 0
  };
  let {
    data: [{ id, affected_rows }]
  } = await addArticle(params).catch((e) => {
    console.log(e);
  });
  return { id, success: affected_rows > 0, receiver };
};

// 拼接文章内容
const getHtml = async () => {
  let htmlChange = await ananysisChangeRecord();
  let htmlRepair = await ananysisRepairRecord();

  const titleHtml = `<p>昨日(${moment()
    .subtract(1, 'days')
    .format('YYYY-MM-DD')} ${moment()
    .subtract(1, 'days')
    .format(
      'dddd'
    )})机台关键生产作业信息如下,<a href="http://10.8.2.133:8000/table#id=494/71f0b4f57c&id=495/396c53a4d8&id=604/560029dccc&id=605/e11c753ca6&id=606/18eebf296c" target="_blank">各工序详细记录点击此处访问</a>：</p>`;

  let msg =
    titleHtml +
    htmlChange +
    htmlRepair +
    '<blockquote class="remark">该信息由消息分析系统自动发布。</blockquote>';
  return msg;
};

// 是否包含关键词
const haveSelectedWord = (word) => {
  let arr = ['换', '修', '色模', '印版', '钳工', '电工', '全花版', '刀'];
  let flag = false;
  for (let i = 0; i < arr.length && !flag; i++) {
    let item = arr[i];
    if (
      word.includes(item) &&
      !word.includes('压印') &&
      !word.includes('辊子') &&
      !word.includes('擦版辊')
    ) {
      flag = true;
    }
  }
  return flag;
};

const splitWord = (str, mode = 1) => {
  let wordArr = str.split(
    /，|。| |；|！|\~|\,|\.|\;|\:|\"|\'|“|‘|”|’|、|\(|\)|（|）/
  );
  let status = false;
  wordArr.forEach((item) => {
    // 关键词匹配
    if (mode == 1 && haveSelectedWord(item)) {
      status = true;
      str = str.replace(item, `<strong color="#e23;">${item}</strong>`);
    } else if (mode == 2 && item.includes('中途') && item.includes('压印')) {
      status = true;
      str = str.replace(item, `<strong color="#e23;">${item}</strong>`);
    }
  });
  return { record: str, status };
};

const concatMsg = (arr, html, mode = 1) => {
  if (arr.length == 0) {
    html += '<p>今日无相关记录</p>';
  }
  arr.forEach((item, idx) => {
    let { record, status } = splitWord(item['生产记录'], mode);

    // 再次排除部分无意义的信息
    if (status) {
      html += `<p>(${idx + 1}).【${item['品种']}品 ${item['班次']}】 ${
        item['工序']
      } ${item['机台']}机 ${
        item['机长']
      } 机台：</p><blockquote style="background-color:#eee;font-size: 16px;border-left-color: rgba(255, 73, 73, 0.46);padding-left: 15px;max-width:900px;">${record}</blockquote>`;
    }
  });
  return html;
};

// 更换记录
const ananysisChangeRecord = async () => {
  let { data } = await getVCbpcCartlist(moment().format('YYYY-MM-DD 00:00:00'));
  let msgArr1 = [],
    msgArr2 = [],
    msgArr3 = [];

  data.forEach((item) => {
    let record = item['生产记录'];
    if (record.includes('色模')) {
      msgArr1 = [...msgArr1, item];
    } else if (record.includes('印版')) {
      msgArr2 = [...msgArr2, item];
    } else {
      msgArr3 = [...msgArr3, item];
    }
  });

  let { data: dataChange } = await getVCbpcCartlistChange(
    moment().format('YYYY-MM-DD 00:00:00')
  );

  // 色模
  let html = `<h3>一、印刷材料更换记录</h3><h4>1.色模</h4>`;
  html = concatMsg(msgArr1, html);

  // 印版
  html += `<h4>2.印版</h4>`;
  html = concatMsg(msgArr2, html);

  html += `<h4>3.中途换压印</h4>`;
  html = concatMsg(dataChange, html, 2);

  // 其它
  html += `<h4>4.其它</h4>`;
  html = concatMsg(msgArr3, html);

  return html;
};

// 维修记录
const ananysisRepairRecord = async () => {
  let { data } = await getVCbpcCartlistRepaire(
    moment().format('YYYY-MM-DD 00:00:00')
  );
  let msgArr1 = [],
    msgArr2 = [],
    msgArr3 = [];
  data.forEach((item) => {
    let record = item['生产记录'];
    if (record.includes('电工')) {
      msgArr1 = [...msgArr1, item];
    } else if (record.includes('钳工')) {
      msgArr2 = [...msgArr2, item];
    } else {
      msgArr3 = [...msgArr3, item];
    }
  });

  // 电工
  let html = `<h3 style="margin-top: 80px;">二、设备维修记录</h3><h4>1.电工</h4>`;
  html = concatMsg(msgArr1, html);

  // 钳工
  html += `<h4>2.钳工</h4>`;
  html = concatMsg(msgArr2, html);

  // 其它
  html += `<h4>3.其它</h4>`;
  html = concatMsg(msgArr3, html);

  return html;
};

/**
 *   @database: { MES_MAIN }
 *   @desc:     { 质量平台_物资更换记录 }
 */
const getVCbpcCartlist = (tstart) =>
  DEV
    ? mock(require('../mock/369_46711c29b7.json'))
    : axios({
        url: '/369/46711c29b7.json',
        params: {
          tstart
        }
      });

const getVCbpcCartlistRepaire = (tstart) =>
  DEV
    ? mock(require('../mock/371_aaa388f8fd.json'))
    : axios({
        url: '/371/aaa388f8fd.json',
        params: {
          tstart
        }
      });
const getVCbpcCartlistChange = (tstart) =>
  DEV
    ? mock(require('../mock/375_e08968b889.json'))
    : axios({
        url: '/375/e08968b889.json',
        params: {
          tstart
        }
      });

/** NodeJS服务端调用：
 *
 *   @database: { 工艺质量管理 }
 *   @desc:     { 消息机器人是否已推送换修记录 }
 */
const getTblArticle = () =>
  DEV
    ? mock(require('../mock/370_b210f0b4cd.json'))
    : axios({
        url: '/370/b210f0b4cd.json'
      });

/** 数据量较大时建议使用post模式：
*
*   @database: { 工艺质量管理 }
*   @desc:     { 新增文章 } 
    const { uid, rec_time, attach_list, prod, proc, machine, operator, cartno, cate_id, content, title, receiver, remark, reward, reward_status, reward_user, status_username, sys_id } = params;
*/
const addArticle = (params) =>
  DEV
    ? mock(_commonData)
    : axios({
        method: 'post',
        data: {
          ...params,
          id: 316,
          nonce: '523c5e087b'
        }
      });
/**
 *   @database: { 工艺质量管理 }
 *   @desc:     { 更新自动推送消息阅读状态 }
 */
const setArticle = () =>
  DEV
    ? mock(_commonData)
    : axios({
        url: '/372/ee25f02ee2.json'
      });

module.exports = {
  init,
  isWorkTime,
  getWeekEnd,
  ananysisChangeRecord,
  ananysisRepairRecord,
  splitWord,
  getHtml,
  publishArticle
};
