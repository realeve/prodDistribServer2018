module.exports = {
  '/api': 'API列表',
  '/api/manual_status': {
    desc: '人工大张拉号，车号已领取后，更新状态。',
    param: {
      cart: 'varchar,车号'
    },
    return: { "data": [{ "affected_rows": 0 }], "title": "人工抽检领活", "rows": 1, "time": "2.682ms", "header": ["affected_rows"], "status": true }
  },
  '/api/after_print': {
    desc: '下机产品，通知已生产完成状态以及当前工序。后台将分别对四新产品、异常品、机台通知作废产品的完成进度更新。',
    param: {
      process: 'varchar,当前生产工序',
      status: 'int,生产状态，当生产工序为检封清分机/裁封时应更新状态为1，其余为0',
      cart: 'varchar,车号'
    },
    return: { "dataNewProc": { "data": [{ "affected_rows": 0 }], "title": "下机产品通知已完成状态以及工序", "rows": 1, "time": "2.791ms", "header": ["affected_rows"] }, "dataAbnormal": { "data": [{ "affected_rows": 0 }], "title": "更新异常品完工状态", "rows": 1, "time": "36.754ms", "header": ["affected_rows"] }, "dataMultiweak": { "data": [{ "affected_rows": 0 }], "title": "机台生产异常信息完工状态跟踪", "rows": 1, "time": "29.28ms", "header": ["affected_rows"] }, "status": true }
  },
  '/api/before_print': {
    desc: '机台领用产品后，印刷前通知车号，工序，机台。',
    param: {
      process: 'varchar,当前生产工序',
      machine_name: 'varchar,领用机台名称',
      cart: 'varchar,车号'
    },
    return: { status: true }
  },
  '/api/multiweak': {
    desc: '读取某万产品是否有连续废通知',
    param: {
      cart: 'varchar,车号'
    },
    return: { "data": [{ "cart_number": "1820A234", "count": "2" }], "title": "当前车号是否有连续废通知", "rows": 1, "time": "2.572ms", "header": ["cart_number", "count"], "status": true }
  },
  '/api/user/:username': {
    desc: '根据用户名腾讯通用户信息',
    return: { "status": true, "data": [{ "dept_id": 1, "rtx_id": 54001987, "username": "倪震", "rtxuid": 10093, "gender": "男", "dept_name": "企划信息部" }] }
  },
  '/api/rtxlist/:proc': {
    desc: '根据工序名获取待推送用户信息',
    return: { "status": true, "rtxList": [{ "dept_id": 17, "rtx_id": 54002643, "username": "吕从飞", "rtxuid": 10754, "gender": "男", "dept_name": "检封制作部" }, { "dept_id": 29, "rtx_id": 54002612, "username": "胡新玥", "rtxuid": 10861, "gender": "女", "dept_name": "印钞管理部" }, { "dept_id": 29, "rtx_id": 54002015, "username": "杨林", "rtxuid": 10862, "gender": "男", "dept_name": "印钞管理部" }, { "dept_id": 29, "rtx_id": 54002545, "username": "冯诗伟", "rtxuid": 11165, "gender": "男", "dept_name": "印钞管理部" }, { "dept_id": 29, "rtx_id": 54002861, "username": "蒋荣", "rtxuid": 11167, "gender": "男", "dept_name": "印钞管理部" }, { "dept_id": 29, "rtx_id": 54004348, "username": "任礼科", "rtxuid": 11166, "gender": "男", "dept_name": "印钞管理部" }, { "dept_id": 29, "rtx_id": 54002577, "username": "袁长虹", "rtxuid": 10863, "gender": "女", "dept_name": "印钞管理部" }] }
  }
}