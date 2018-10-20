var req = {
  "start_time": "2018-09-19 00:00:00",
  "end_time": "2018-09-19 23:59:59",
  "user_list": [{
    "user_no": "54000957",
    "user_name": "邓玉红",
    "work_long_time": 0.875
  }, {
    "user_no": "54001703",
    "user_name": "蒋静",
    "work_long_time": 0.75
  }, {
    "user_no": "54002625",
    "user_name": "彭瑶",
    "work_long_time": 0.625
  }, {
    "user_no": "54001793",
    "user_name": "龚季敏",
    "work_long_time": 1
  }, {
    "user_no": "54001789",
    "user_name": "李小平",
    "work_long_time": 1
  }, {
    "user_no": "54001664",
    "user_name": "李鹤玲",
    "work_long_time": 1
  }, {
    "user_no": "54001804",
    "user_name": "邓丽",
    "work_long_time": 1
  }, {
    "user_no": "54001692",
    "user_name": "蒙娅",
    "work_long_time": 1
  }, {
    "user_no": "54001966",
    "user_name": "何莉",
    "work_long_time": 1
  }, {
    "user_no": "54002137",
    "user_name": "刘照英",
    "work_long_time": 0.5
  }, {
    "user_no": "54001585",
    "user_name": "何建英",
    "work_long_time": 1
  }, {
    "user_no": "54001707",
    "user_name": "杜希",
    "work_long_time": 0.25
  }, {
    "user_no": "54001363",
    "user_name": "杨亚蓉",
    "work_long_time": 1
  }, {
    "user_no": "54001700",
    "user_name": "张素珍",
    "work_long_time": 1
  }, {
    "user_no": "54001656",
    "user_name": "夏志英",
    "work_long_time": 0.375
  }, {
    "user_no": "54002710",
    "user_name": "赵川",
    "work_long_time": 1
  }, {
    "user_no": "54002159",
    "user_name": "何媛方",
    "work_long_time": 0.125
  }, {
    "user_no": "54001576",
    "user_name": "李晓红",
    "work_long_time": 0.4
  }]
};

var res = {
  unupload_carts: ['1820B876', '1820C012'], // 未上传车号列表
  task_list: [{
    base: {
      user_name: '张三', // 姓名
      user_no: 2322, // 卡号
      percent: 1, // 分配比例，最大为1.以上三项均为请求发起时给定信息
      total_num: 21034, // 当前任务总条数
      expect_num: 21090, // 当前任务期望条数
      total_num_month: 524099, // 本月实际判废条数
      cart_nums: 8 // 当前任务分派大万数
    },
    data: [{
      cart_number: '1820A233', // 车号
      err_num: 2322, // 缺陷条数
      is_upload: true // 当车产品是否上传
    }, {
      cart_number: '1820A235',
      err_num: 4346
    }]
  }, {
    base: {
      user_name: '李晓红',
      user_no: 2322,
      percent: 0.98,
      total_num: 21034,
      expect_num: 21090,
      total_num_month: 524099,
      cart_nums: 8
    },
    data: [{
      cart_number: '1820A233',
      err_num: 2322,
      is_upload: true // 当车产品是否上传
    }, {
      cart_number: '1820A235',
      err_num: 4346
    }]
  }, {
    base: {
      user_name: '何媛方',
      user_no: 2322,
      percent: 0.7,
      total_num: 21034,
      expect_num: 21090,
      total_num_month: 524099,
      cart_nums: 8
    },
    data: [{
      cart_number: '1820A233',
      err_num: 2322,
      is_upload: true // 当车产品是否上传
    }, {
      cart_number: '1820A235',
      err_num: 4346
    }]
  }]
}
