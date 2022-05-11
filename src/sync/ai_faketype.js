let axios = require("axios");
let task_name = "AI判废 缺陷类型自动分类";
let moment = require('moment');


const init = async (prodName = '9604T') => {
    console.log(`开始 ${prodName} ${task_name}`);
    // 上月作为开始月份时间
    monthName = moment().subtract(1, 'month').format('YYYYMM');
    url = `http://10.8.60.241:8000/api/imagetype?tstart=${monthName}&prod=${prodName}`
    console.log(url)
    axios(url)
}


module.exports = { init };
