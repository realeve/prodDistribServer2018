const R = require('ramda')
let {
  userList,
  procList,
  users
} = require('./userList');

const axios = require('axios');

const rtxPush = async ({ msg, receiver }) => {
  const option = {
    url: 'http://10.8.2.133/datainterface/rtxpush',
    params: {
      title: '工艺质量流转通知',
      msg,
      receiver: receiver.join(',')
    }
  };
  return await axios(option)
}

let needPush = proc => procList.includes(proc);

let getUserListByDept = dept_name => R.filter(R.propEq('dept_name', dept_name))(users)

// 根据工艺名称获取需要推送的人员信息
let getRtxList = proc => {
  let status = needPush(proc);
  if (!status) {
    return { status }
  };

  let { rtxInfo } = userList.find(item => item.proc_name.includes(proc));
  let rtxList = [];

  rtxInfo.map(({ dept_name, userList }) => {
    let deptUsers = getUserListByDept(dept_name);
    let userInfo = R.filter(item => userList.includes(item.username))(deptUsers);
    rtxList = [...rtxList, ...userInfo];
  })
  return { status, rtxList }
}

let pushMsg = async ({ proc, msg }) => {
  let { status, rtxList } = getRtxList(proc);
  if (!status) {
    return { status };
  }
  let receiver = R.map(R.prop('rtxuid'))(rtxList)

  // 测试信息，推送至李宾
  receiver = [10654, 10093]
  console.log(receiver);
  let { data } = await rtxPush({ msg, receiver });

  console.log(data);
  return {
    status,
    data
  }
}

module.exports = { getRtxList, pushMsg }