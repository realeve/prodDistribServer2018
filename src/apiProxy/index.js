const Koa = require('koa');
const consola = require('consola');
const app = new Koa();
const router = require('./router');

const port = 3000;

const init = () => {

  app
    .use(router.routes())
    .use(router.allowedMethods());
  app.listen(port);
  consola.success(`start api server success:\n http://localhost:${port};`)
}

module.exports = { init };