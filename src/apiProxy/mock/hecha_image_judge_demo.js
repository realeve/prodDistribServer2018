var url = 'http://10.8.1.27:4000/api/hecha/task';
var data = {
  tstart: 20190219,
  tend: 20190219,
  user_list: [
    {
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
/**
 * 参数说明：limit,prod,need_convert,precision四个参数可以不传。
 * limit表示默认20000条以下参与排活，超过不排活
 * prod:默认全部品种参与排活，指定品种则像demo一样传出品种名
 * precision:每包相差100条时不再遍历
 * need_convert，默认做数据行列转换，不转换时将输出更详细的内容
 *  */
$.ajax({ method: 'POST', url, data }).done((res) => {
  console.log(res);
});
