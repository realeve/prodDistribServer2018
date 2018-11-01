url = 'http://localhost:3000/api/hecha/task';
data = {
    tstart: 20181101,
    tend: 20181101,
    user_list: [{
            user_no: '54002137',
            user_name: '刘照英',
            work_long_time: 0.5
        },
        {
            user_no: '54001707',
            user_name: '杜希',
            work_long_time: 0.625
        },
        {
            user_no: '54001656',
            user_name: '夏志英',
            work_long_time: 0.775
        },
        {
            user_no: '54002710',
            user_name: '赵川',
            work_long_time: 1
        },
        {
            user_no: '54002159',
            user_name: '何媛方',
            work_long_time: 0.825
        },
        {
            user_no: '54001576',
            user_name: '李晓红',
            work_long_time: 0.4
        }
    ],
    limit: 20000,
    prod: ['9607T', '9602A'],
    need_convert: 1,
    precision: 100
};

$.ajax({ method: 'POST', url, data }).done(res => {
    console.log(res)
})