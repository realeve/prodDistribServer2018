let handleNewProc = require("./handleNewProc");
let wms = require("./wmsTest");

const init = async () => {
  // await handleNewProc.init().catch(e => console.log(e));
  await wms.init();
};

module.exports = { init };
