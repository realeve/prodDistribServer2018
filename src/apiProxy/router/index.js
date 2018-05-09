const Router = require('koa-router');
const router = new Router();
const util = require('./util');
const db = require('./db');

router.get('/', ctx => {
  ctx.body = 'hello worlds';
});

router.get('/api', ctx => {
  ctx.body = {
    '/api': 'API列表',
    '/api/manual_status': {
      desc: '人工大张拉号，车号已领取后，更新状态。',
      param: {
        cart: 'varchar,车号'
      },
      return: { "data": [{ "affected_rows": 0 }], "title": "人工抽检领活", "rows": 1, "time": "2.682ms", "header": ["affected_rows"], "status": true }
    },
    '/api/after_print': {
      desc: '下机产品，通知已生产完成状态以及当前工序。',
      param: {
        process: 'varchar,当前生产工序',
        status: 'int,生产状态，当生产工序为检封清分机/裁封时应更新状态为1，其余为0',
        cart: 'varchar,车号'
      },
      return: { "data": [{ "affected_rows": 0 }], "title": "下机产品通知已完成状态以及工序", "rows": 1, "time": "22.544ms", "header": ["affected_rows"], "status": true }
    },
    '/api/before_print': {
      desc: '机台领用产品后，印刷前通知车号，工序，机台。',
      param: {
        process: 'varchar,当前生产工序',
        machine_name: 'varchar,领用机台名称',
        cart: 'varchar,车号'
      },
      return: { status: true }
    }
  }
});

// 人工大张拉号，车号已领取后，更新状态。
router.get('/api/manual_status', async ctx => {
  let validInfo = util.validateParam(ctx, ['cart']);
  if (!validInfo.status) {
    ctx.body = validInfo
    return;
  }

  let { cart } = ctx.query;
  let data = await db.setPrintSampleCartlist(cart);
  data.status = true;
  ctx.body = data;
})

// 下机产品，通知已生产完成状态以及当前工序。
router.get('/api/after_print', async ctx => {
  let validInfo = util.validateParam(ctx, 'process,status,cart'.split(','));
  if (!validInfo.status) {
    ctx.body = validInfo
    return;
  }

  let { process, status, cart } = ctx.query;
  let data = await db.setPrintWmsProclist({ process, status, cart });
  data.status = true;
  ctx.body = data;
})

// 上机前通知接口
router.get('/api/before_print', async ctx => {
  let validInfo = util.validateParam(ctx, 'process,machine_name,cart'.split(','));
  if (!validInfo.status) {
    ctx.body = validInfo
    return;
  }

  let { process, machine_name, cart } = ctx.query;

  ctx.body = { process, machine_name, cart };
})


module.exports = router;