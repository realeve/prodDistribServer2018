const Koa = require('koa');
const consola = require('consola');
const app = new Koa();
const router = require('./router');

const port = 3000;

const cors = require('koa2-cors');

// CORS 白名单列表
const whiteList = ['http://10.8.2.11:8080', 'http://localhost:8080', 'http://cognosdb.cdyc.cbpm:8001', 'http://cognosdb.cdyc.cbpm:8080']

// 具体参数我们在后面进行解释
app.use(cors({
  origin: function(ctx) {
    const { origin } = ctx.header;
    return whiteList.includes(origin) ? origin : 'http://10.8.1.27:4000';
  },
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}))


const init = () => {

  app
    .use(router.routes())
    .use(router.allowedMethods());
  app.listen(port);
  console.log(`start api server success:\n http://localhost:${port};`)
}

module.exports = { init };