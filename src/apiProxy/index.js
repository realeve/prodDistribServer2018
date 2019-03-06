const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const router = require('./router');
const qs = require('querystring');
const app = new Koa();
const compress = require('koa-compress');
const port = 3000;

const cors = require('koa2-cors');
const R = require('ramda');
const he = require('he');
const Parser = require('fast-xml-parser').j2xParser;
const xmlOptions = {
  attributeNamePrefix: '@_',
  attrNodeName: '@', //default is false
  textNodeName: '#text',
  ignoreAttributes: true,
  cdataTagName: '__cdata', //default is false
  cdataPositionChar: '\\c',
  format: false,
  indentBy: '  ',
  supressEmptyNode: false,
  tagValueProcessor: (a) => he.encode(a, { useNamedReferences: true }), // default is a=>a
  attrValueProcessor: (a) =>
    he.encode(a, { isAttributeValue: isAttribute, useNamedReferences: true }) // default is a=>a
};
const parser = new Parser(xmlOptions);

// CORS 白名单列表
const whiteList = [
  'http://10.8.2.11:8080',
  'http://localhost:8080',
  'http://localhost:8000',
  'http://cognosdb.cdyc.cbpm:8001',
  'http://cognosdb.cdyc.cbpm:8080',
  'http://10.8.2.133:92',
  'http://10.8.2.133:90',
  'http://10.8.2.133',
  'http://10.9.3.1:7700'
];

// 具体参数我们在后面进行解释
app.use(
  cors({
    origin: function(ctx) {
      const { origin } = ctx.header;
      return whiteList.includes(origin) ? origin : 'http://10.8.1.27:4000';
    },
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept']
  })
);

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
  // logger
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.use(bodyParser());

// handle xml
app.use(async (ctx, next) => {
  let xml = R.propOr(false, 'xml')(ctx.request.body);
  if (!xml) {
    xml = R.propOr(false, 'xml')(ctx.request.query);
  }
  xml = parseInt(xml, 10) > 0;
  await next();
  if (!xml) {
    return;
  }
  ctx.body = parser.parse({
    data: ctx.body
  });
  ctx.response.type = 'application/xml';
});

app.use(
  compress({
    filter: function(content_type) {
      return /text/i.test(content_type);
    },
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
  })
);

const init = () => {
  app.use(router.routes()).use(router.allowedMethods());
  app.listen(port);
  console.log(`start api server success:\n http://localhost:${port};`);
};

module.exports = { init };
