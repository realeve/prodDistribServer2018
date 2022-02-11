// 后台同步服务

// const boxpackage_upload = require("../src/sync/boxpackage_upload");

// const handleErr = ({ response }) =>
//     console.log({ status: response.status, statusText: response.statusText });

// boxpackage_upload.init().catch(handleErr);


// 后台同步服务
const sync = require("../src/sync/first3page");
sync.init()
