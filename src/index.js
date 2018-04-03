let handleNewProc = require("./handleNewProc");

const init = async () => {
  await handleNewProc.init().catch(e => console.log(e));
};

module.exports = { init };
