module.exports = {
    '/api': 'API列表',
    '/api/remark_info': {
        desc: '产品锁车原因说明',
        param: {
            cart: 'varchar,车号'
        },
        return: {
            data: [
                { remark: '【异常品】M81D-2号 33K-40K国徽有点浅' },
                { remark: '【人工大张日常抽检】' }
            ],
            title: '产品锁车原因',
            rows: 2,
            time: '7.394ms',
            header: ['remark'],
            status: true
        }
    },
    '/api/manual_status': {
        desc: '人工大张拉号，车号已领取后，更新状态。',
        param: {
            cart: 'array,车号列表',
            update_machine: {
                type: 'int',
                value: [
                    '默认1:更新车号领用信息',
                    '0：不更新车号领用信息，用于取消人工拉号'
                ]
            }
        },
        return: {
            data: [{ affected_rows: 0 }],
            title: '人工抽检领活',
            rows: 1,
            time: '2.682ms',
            header: ['affected_rows'],
            status: true
        }
    },
    '/api/after_print': {
        desc: '下机产品，通知已生产完成状态以及当前工序。后台将分别对四新产品、异常品、机台通知作废产品的完成进度更新。',
        param: {
            process: 'varchar,当前生产工序',
            status: 'int,生产状态，当生产工序为检封清分机/裁封时应更新状态为1，其余为0',
            cart: 'varchar,车号'
        },
        return: {
            dataNewProc: {
                data: [{ affected_rows: 0 }],
                title: '下机产品通知已完成状态以及工序',
                rows: 1,
                time: '2.791ms',
                header: ['affected_rows']
            },
            dataAbnormal: {
                data: [{ affected_rows: 0 }],
                title: '更新异常品完工状态',
                rows: 1,
                time: '36.754ms',
                header: ['affected_rows']
            },
            dataMultiweak: {
                data: [{ affected_rows: 0 }],
                title: '机台生产异常信息完工状态跟踪',
                rows: 1,
                time: '29.28ms',
                header: ['affected_rows']
            },
            status: true
        }
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
        desc: '读取指定大万列表产品是否有连续废通知',
        url: 'http://localhost:3000/api/multiweak?cart=1820A234&cart=1860B008&cart=1860B362',
        param: {
            cart: 'varchar,车号'
        },
        return: {
            data: [
                { cart_number: '1820A234', count: '2' },
                { cart_number: '1860B008', count: '1' },
                { cart_number: '1860B362', count: '1' }
            ],
            title: '当前车号是否有连续废通知',
            rows: 3,
            time: '1.982ms',
            header: ['cart_number', 'count'],
            status: true
        }
    },
    '/api/user/:username': {
        desc: '根据用户名腾讯通用户信息',
        return: {
            status: true,
            data: [{
                dept_id: 1,
                rtx_id: 54001987,
                username: '倪震',
                rtxuid: 10093,
                gender: '男',
                dept_name: '企划信息部'
            }]
        }
    },
    '/api/hecha/task': {
        desc: '根据工序名获取待推送用户信息',
        return: {
            status: true,
            rtxList: [{
                    dept_id: 17,
                    rtx_id: 54002643,
                    username: '吕从飞',
                    rtxuid: 10754,
                    gender: '男',
                    dept_name: '检封制作部'
                },
                {
                    dept_id: 29,
                    rtx_id: 54002612,
                    username: '胡新玥',
                    rtxuid: 10861,
                    gender: '女',
                    dept_name: '印钞管理部'
                },
                {
                    dept_id: 29,
                    rtx_id: 54002015,
                    username: '杨林',
                    rtxuid: 10862,
                    gender: '男',
                    dept_name: '印钞管理部'
                },
                {
                    dept_id: 29,
                    rtx_id: 54002545,
                    username: '冯诗伟',
                    rtxuid: 11165,
                    gender: '男',
                    dept_name: '印钞管理部'
                },
                {
                    dept_id: 29,
                    rtx_id: 54002861,
                    username: '蒋荣',
                    rtxuid: 11167,
                    gender: '男',
                    dept_name: '印钞管理部'
                },
                {
                    dept_id: 29,
                    rtx_id: 54004348,
                    username: '任礼科',
                    rtxuid: 11166,
                    gender: '男',
                    dept_name: '印钞管理部'
                },
                {
                    dept_id: 29,
                    rtx_id: 54002577,
                    username: '袁长虹',
                    rtxuid: 10863,
                    gender: '女',
                    dept_name: '印钞管理部'
                }
            ]
        }
    },
    '/api/hecha/task': {
        desc: '图像核查判废产量分配',
        url: '/api/hecha/task?tstart=20181101&tend=20181101&user_list=1&limit=20000&prod[]=9607T&prod[]=9602A',
        param: {
            tstart: 20181019,
            tend: 20181019,
            user_list: [{
                    user_no: '54000957',
                    user_name: '邓玉红',
                    work_long_time: 0.875
                },
                {
                    user_no: '54001700',
                    user_name: '张素珍',
                    work_long_time: 1
                },
                {
                    user_no: '54002137',
                    user_name: '刘照英',
                    work_long_time: 0.5
                },
                {
                    user_no: '54001656',
                    user_name: '夏志英',
                    work_long_time: 0.775
                }
            ],
            need_convert: 1,
            prod: '默认全部品种',
            limit: 2000,
            precision: 100
        },
        return: {
            task_list: [{
                    user_no: '54001793',
                    user_name: '龚季敏',
                    work_long_time: 1,
                    expect_num: 20960,
                    expect_carts: 8.53,
                    real_num: 20912,
                    carts_num: 9,
                    delta_num: -48,
                    month: { cart_nums: 6, pf_num: 15817 },
                    data: [{
                            type: 0,
                            cart_number: '1880E678',
                            product_name: '9607T',
                            start_date: '2018-10-19 09:22:30',
                            pf_num: 7872
                        },
                        {
                            type: 1,
                            cart_number: '1880E652',
                            product_name: '9607T',
                            start_date: '2018-09-07 08:39:42',
                            pf_num: 278
                        },
                        {
                            type: 0,
                            cart_number: '1820E254',
                            product_name: '9602A',
                            start_date: '2018-10-19 09:28:25',
                            pf_num: 3973
                        },
                        {
                            type: 0,
                            cart_number: '1820E039',
                            product_name: '9602A',
                            start_date: '2018-10-19 07:54:56',
                            pf_num: 551
                        },
                        {
                            type: 0,
                            cart_number: '1830C618',
                            product_name: '9603A',
                            start_date: '2018-10-19 16:37:19',
                            pf_num: 3199
                        },
                        {
                            type: 1,
                            cart_number: '1880E635',
                            product_name: '9607T',
                            start_date: '2018-09-05 20:01:01',
                            pf_num: 741
                        },
                        {
                            type: 1,
                            cart_number: '1880E788',
                            product_name: '9607T',
                            start_date: '2018-09-11 10:17:31',
                            pf_num: 1985
                        },
                        {
                            type: 0,
                            cart_number: '1820E243',
                            product_name: '9602A',
                            start_date: '2018-10-19 16:31:19',
                            pf_num: 864
                        },
                        {
                            type: 0,
                            cart_number: '1820E092',
                            product_name: '9602A',
                            start_date: '2018-10-19 16:41:39',
                            pf_num: 1449
                        }
                    ],
                    success: true,
                    finished: true
                },
                {
                    user_no: '54001576',
                    user_name: '李晓红',
                    work_long_time: 0.4,
                    expect_num: 8384,
                    expect_carts: 3.41,
                    real_num: 8341,
                    carts_num: 4,
                    delta_num: -43,
                    month: { cart_nums: 4, pf_num: 15817 },
                    data: [{
                            type: 0,
                            cart_number: '1820D997',
                            product_name: '9602A',
                            start_date: '2018-10-19 13:38:47',
                            pf_num: 4304
                        },
                        {
                            type: 1,
                            cart_number: '1880E584',
                            product_name: '9607T',
                            start_date: '2018-09-10 12:42:19',
                            pf_num: 252
                        },
                        {
                            type: 0,
                            cart_number: '1830C613',
                            product_name: '9603A',
                            start_date: '2018-10-19 08:05:59',
                            pf_num: 3246
                        },
                        {
                            type: 1,
                            cart_number: '1880E645',
                            product_name: '9607T',
                            start_date: '2018-09-06 16:42:24',
                            pf_num: 539
                        }
                    ],
                    success: true,
                    finished: false
                },
                {
                    user_no: '54002137',
                    user_name: '刘照英',
                    work_long_time: 0.5,
                    expect_num: 10480,
                    expect_carts: 4.27,
                    real_num: 10449,
                    carts_num: 4,
                    delta_num: -31,
                    month: { cart_nums: 5, pf_num: 15488 },
                    data: [{
                            type: 0,
                            cart_number: '1820E065',
                            product_name: '9602A',
                            start_date: '2018-10-19 19:14:09',
                            pf_num: 5938
                        },
                        {
                            type: 1,
                            cart_number: '1880E649',
                            product_name: '9607T',
                            start_date: '2018-09-06 18:32:03',
                            pf_num: 236
                        },
                        {
                            type: 0,
                            cart_number: '1820E082',
                            product_name: '9602A',
                            start_date: '2018-10-19 17:58:32',
                            pf_num: 3660
                        },
                        {
                            type: 0,
                            cart_number: '1820E080',
                            product_name: '9602A',
                            start_date: '2018-10-19 17:56:05',
                            pf_num: 615
                        }
                    ],
                    success: true,
                    finished: false
                }
            ],
            unupload_carts: [{
                    prod_name: '9607T',
                    cart_number: '1880E726',
                    proc_name: '全检品',
                    machine_name: 'M97-1号'
                },
                {
                    prod_name: '9603A',
                    cart_number: '1830C720',
                    proc_name: '码后核查',
                    machine_name: '多功能-2号'
                }
            ]
        }
    }
};