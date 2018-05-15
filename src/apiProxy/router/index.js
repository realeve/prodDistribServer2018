const Router = require('koa-router');
const router = new Router();
const util = require('./util');
const db = require('./db');
const lib = require('../../util/lib')
const api_doc = require('./api_document')
const users = require('../../util/rtx')
const R = require('ramda');
const rtx = require('../rtx/index')
const db2 = require('../../util/db')

router.get('/', ctx => {
  ctx.body = 'hello worlds';
});

router.get('/api', ctx => {
  ctx.body = api_doc
});

// 人工大张拉号，车号已领取后，更新状态。
router.get('/api/manual_status', async ctx => {
  let validInfo = util.validateParam(ctx, ['cart']);
  if (!validInfo.status) {
    ctx.body = validInfo
    return;
  }

  let { cart } = ctx.query;
  // step1: 更新车号状态
  let data = await db.setPrintSampleCartlist(cart);
  // step2: 添加该车产品对应的机台具体抽检万数
  await db.setPrintSampleMachine(cart);

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
  // step1:通知四新产品完工状态
  let dataNewProc = await db.setPrintWmsProclist({ process, status, cart });
  // step2:通知异常品完工状态
  let dataAbnormal = await db.setPrintAbnormalProd({ process, status, cart, prod_date: lib.now() })
  // step3:机台通知连续作废产品完工状态
  let dataMultiweak = await db.setPrintMachinecheckMultiweak({ process, status, cart, prod_date: lib.now() })
  let data = { dataNewProc, dataAbnormal, dataMultiweak }
  data.status = true;
  ctx.body = data;
})

// 连续废通知
router.get('/api/multiweak', async ctx => {
  let validInfo = util.validateParam(ctx, 'cart'.split(','));
  if (!validInfo.status) {
    ctx.body = validInfo
    return;
  }

  let { cart } = ctx.query;
  let data = await db.getPrintMachinecheckMultiweak(cart);
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
  let msg = `车号${cart}已由机台${machine_name}领用至${process}工序(${lib.now()}).\n[(点击此处查看详情)|http://10.8.2.133/topic/multiweak.html?cart=${cart}]`
  let data = await rtx.pushMsg({ proc: process, msg });
  ctx.body = data
})

// 获取指定用户的rtx信息
router.get('/api/user/:uid', async ctx => {
  let { uid } = ctx.params;
  ctx.body = {
    status: true,
    data: R.filter(R.propEq('username', uid))(users)
  }
});

// 根据工序名称获取待推送人员名单rtx信息
router.get('/api/rtxlist/:proc', async ctx => {
  let { proc } = ctx.params;
  ctx.body = rtx.getRtxList(proc)
});

// router.get('/api/addlog', async ctx => {
//   // 记录日志信息，wms提交及返回的数据全部入库
//   let logInfo = await db2.addPrintWmsLog([{
//     remark: 'JSON.stringify({ carnos, proc_stream })',
//     rec_time: lib.now(),
//     return_info: 'JSON.stringify(result)'
//   }]);
//   ctx.body = logInfo
// })


module.exports = router;