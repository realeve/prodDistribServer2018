const app = require("./src/index");
const proxy = require('./src/apiProxy');

const init = () => {
  proxy.init();
  // app.init();
}

init();