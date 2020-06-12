// 调度任务服务
const app = require("../src/index");

app.init();

// 后台同步服务
const sync = require("../src/sync");

sync.init();
