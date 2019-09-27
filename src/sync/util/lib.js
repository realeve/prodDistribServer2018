let moment = require('moment');

const now = () => moment().format('YYYY-MM-DD HH:mm:ss');
const ymd = () => moment().format('YYYYMMDD');

// 2019-02-16
// 合并机台作业及MES系统中数据，提供前后两个接口，
const concatMesAndJtzy = (resJTZY, resMES) => {
  resJTZY.rows += resMES.rows;
  resJTZY.data = [...resJTZY.data, ...resMES.data];
  return resJTZY;
};

module.exports = { now, ymd, concatMesAndJtzy };
