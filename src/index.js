let { axios, getToken } = require("./util/axios");

const init = async () => {
  let token = await getToken();
  console.log(token);
};

module.exports = { init };
