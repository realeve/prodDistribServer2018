// 后台同步服务

// const boxpackage_upload = require("../src/sync/boxpackage_uploadjtzy");

// const handleErr = ({ response }) =>
//   console.log({ status: response.status, statusText: response.statusText });

// boxpackage_upload.init().catch(handleErr);
// boxpackage_upload.init2().catch(handleErr);
// boxpackage_upload.init3().catch(handleErr);
// boxpackage_upload.init4().catch(handleErr);
// boxpackage_upload.init5().catch(handleErr);



// 后台同步服务
const sync = require("../src/sync");

sync.init();
