let moment = require("moment");

const now = () => moment().format("YYYY-MM-DD HH:mm:ss");
const ymd = () => moment().format("YYYYMMDD");

module.exports = { now, ymd };
