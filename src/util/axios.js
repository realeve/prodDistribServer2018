let http = require("axios");
let qs = require("qs");
let fs = require("fs");

let dev = true;

let host = dev ? "http://localhost:90/api/" : "http://10.8.1.25:100/api/";

// 程序主目录
let getMainContent = () => {
  let PROGRAM_NAME = "prodDistribServer2018";
  let str = process.cwd().split(PROGRAM_NAME)[0] + PROGRAM_NAME;
  return str.replace(/\\/g, "/");
};

let getToken = async shopId => {
  let fileName = `${getMainContent()}/src/util/token.json`;
  try {
    let token = fs.readFileSync(fileName, "utf-8");
    return token;
  } catch (e) {
    let url = host + "authorize.json?user=develop&psw=111111";
    let token = await http.get(url).then(res => res.data.token);
    saveToken(token);
    return token;
  }
};

// 判断数据类型，对于FormData使用 typeof 方法会得到 object;
let getType = data =>
  Object.prototype.toString
    .call(data)
    .match(/\S+/g)[1]
    .replace("]", "")
    .toLowerCase();

const saveToken = token => {
  let fileName = `${getMainContent()}/src/util/token.json`;
  fs.writeFileSync(fileName, token);
};

// 自动处理token更新，data 序列化等
let axios = async option => {
  let token = await getToken();
  saveToken(token);

  option = Object.assign(option, {
    headers: {
      Authorization: token
    },
    method: option.method ? option.method : "get"
  });

  return await http
    .create({
      baseURL: host,
      timeout: 10000,
      transformRequest: [
        function(data) {
          let dataType = getType(data);
          switch (dataType) {
            case "object":
            case "array":
              data = qs.stringify(data);
              break;
            default:
              break;
          }
          return data;
        }
      ]
    })(option)
    .then(({ data }) => {
      // 刷新token
      if (typeof data.token !== "undefined") {
        token = data.token;
        saveToken(token);
      }
      return data;
    })
    .catch(({ response }) => {
      let req = response.request;
      console.log(req);
      let data = response.data;
      return Promise.reject(data);
    });
};

module.exports = {
  axios,
  dev
};
