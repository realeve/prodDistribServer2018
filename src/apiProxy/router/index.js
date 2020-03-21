const Router = require("koa-router");
const router = new Router();
const util = require("./util");
const db = require("./db");
const lib = require("../../util/lib");
const api_doc = require("./api_document");
const users = require("../../util/rtx");
const R = require("ramda");
const rtx = require("../rtx/index");
const db2 = require("../../util/db");
const db3 = require("./db_hecha");
const dbExcellent = require("../../task/excellentProdLine");

const dbJianFeng = require("./package");
const dbAutoProc = require("./db_auto_proc");
const manualCheck = require("./manual_check");
// const dbExcellentProdLine = require('../../task/excellentProdLine');

router.get("/", ctx => {
  ctx.body = {
    status: 200,
    msg: "hello worlds,this is from get"
  };
});
router.post("/", ctx => {
  ctx.body = {
    status: 200,
    msg: "hello worlds,this is from post"
  };
});

router.get("/api", ctx => {
  ctx.body = api_doc;
});

// 产品指定车号锁车日志
router.get("/api/remark_info", async ctx => {
  let validInfo = util.validateParam(ctx, ["cart"]);
  if (!validInfo.status) {
    ctx.body = validInfo;
    return;
  }

  let { cart } = ctx.query;
  let data = await db.getPrintWmsProclist({
    cart1: cart,
    cart2: cart,
    cart3: cart
  });
  data.status = true;
  ctx.body = data;
});

// 人工大张拉号，车号已领取后，更新状态。
router.get("/api/manual_status", async ctx => {
  let validInfo = util.validateParam(ctx, ["cart"]);
  if (!validInfo.status) {
    ctx.body = validInfo;
    return;
  }

  let { cart, update_machine } = ctx.query;
  if (typeof update_machine == "undefined") {
    update_machine = 1;
  }
  update_machine = update_machine == "0" ? false : true;
  // step1: 更新车号状态
  let data = await db.setPrintSampleCartlist(cart);

  // 当update_machine为0时，用于取消人工拉号
  if (update_machine) {
    // step2: 添加该车产品对应的机台具体抽检万数
    await db.setPrintSampleMachine(cart);
  }

  await db.setPrintWmsProclistStatus(cart);

  data.status = true;
  ctx.body = data;
});

// 下机产品，通知已生产完成状态以及当前工序。
router.get("/api/after_print", async ctx => {
  let { process, status, cart, rec, pay } = ctx.query;
  let validParams = "";
  if (R.isNil(rec)) {
    validParams = "process,status,cart";
  } else {
    validParams = "process,rec,pay,cart";
    // 是清分机时，status=1
    status = ["裁封", "裁切"].includes(process) ? 1 : 0;
  }

  let validInfo = util.validateParam(ctx, validParams.split(","));
  if (!validInfo.status) {
    ctx.body = validInfo;
    return;
  }

  if (pay.includes("人工大张班")) {
    // 人工大张班指定车号完工入库处理
    let res = await manualCheck.init(cart);
    ctx.body = res;
    return;
  }

  // step1:通知四新产品完工状态
  let dataNewProc = await db.setPrintWmsProclist({ process, status, cart });
  // step2:通知异常品完工状态
  let dataAbnormal = await db.setPrintAbnormalProd({
    process,
    status,
    cart,
    prod_date: lib.now()
  });

  // step3:机台通知连续作废产品完工状态
  let dataMultiweak = await db.setPrintMachinecheckMultiweak({
    process,
    status,
    cart,
    prod_date: lib.now()
  });

  // step4:精品线当万下机转换状态
  // 2019-08-15 关闭精品线下机转换
  // let excellent = await dbExcellent.handleExcellentByCart(cart);

  let data = { dataNewProc, dataAbnormal, dataMultiweak };

  data.status = true;

  ctx.body = data;
});

// 连续废通知
router.get("/api/multiweak", async ctx => {
  let validInfo = util.validateParam(ctx, ["cart"]);
  if (!validInfo.status) {
    ctx.body = validInfo;
    return;
  }

  let { cart } = ctx.query;
  let data = await db.getPrintMachinecheckMultiweak(cart);
  data.status = true;
  ctx.body = data;
});

// router.get('/api/autoproc_repaire', async (ctx) => {
//   // 2018-11-28 码前分流处理
//   let data = await dbAutoProc.repaire();
//   ctx.body = data;
// });

// http://localhost:3000/api/autoproc?cart=1880F945&process=%E5%87%B9%E4%B8%80%E5%8D%B0
router.get("/api/autoproc", async ctx => {
  let validInfo = util.validateParam(ctx, "process,cart".split(","));
  if (!validInfo.status) {
    ctx.body = validInfo;
    return;
  }
  let { process, cart } = ctx.query;
  // 2018-11-28 码前分流处理
  let data = await dbAutoProc.init({ process, cart }, true);
  if (data === false) {
    ctx.body = {
      status: 0,
      msg: "无需转工艺"
    };
    return;
  }
  ctx.body = data;
});

// 上机前通知接口
router.get("/api/before_print", async ctx => {
  let { process, machine_name, cart, rec } = ctx.query;

  if (R.isNil(rec)) {
    let { status } = util.validateParam(
      ctx,
      "process,machine_name,cart".split(",")
    );
    if (!status) {
      ctx.body = validInfo;
      return;
    }
  } else {
    let { status } = util.validateParam(ctx, "process,rec,cart".split(","));
    if (!status) {
      ctx.body = validInfo;
      return;
    }
    // 机台信息更新为rec字段
    machine_name = rec;
  }

  // 白纸、过数、胶一印、胶二印、胶印、凹一印、凹二印、凹印、印码、丝印、涂布、裁切、裁封
  // 检封工序上机需要更新wms车号调整列表中的领用情况
  if (["检封", "裁切", "裁封"].includes(process)) {
    await db.setPrintWmsProclistStatus(cart);
  }

  // 产品为异常品或四新产品，经现有流程处理风险
  // 产品为机台连续废通知产品通知工艺员。
  let haveMultiweakNotice = await db2.getPrintMachinecheckMultiweakByCart(cart);
  let data = {
    status: true
  };

  if (haveMultiweakNotice.rows > 0) {
    let msg = `车号${cart}已由机台${machine_name}领用至${process}工序(${lib.now()}).\n[(点击此处查看详情)|http://10.8.2.133/topic/multiweak.html?cart=${cart}]`;
    data = await rtx.pushMsg({ proc: process, msg });
  }

  // 2018-11-19 更新检封任务排活领用状态
  await db.setPrintCutProdLog([cart]);

  // 2018-11-28 码前分流处理
  // 2019-11-02 该部分逻辑转移至精品线处理
  // await dbAutoProc.init({ process, cart });

  // 完工结算中处理产品精品逻辑
  // await dbExcellentProdLine.init({ process, cart, machine_name });
  ctx.body = data;
});

// 获取指定用户的rtx信息
router.get("/api/user/:uid", async ctx => {
  let { uid } = ctx.params;
  ctx.body = {
    status: true,
    data: R.filter(R.propEq("username", uid))(users)
  };
});

// 根据工序名称获取待推送人员名单rtx信息
router.get("/api/rtxlist/:proc", async ctx => {
  let { proc } = ctx.params;
  ctx.body = rtx.getRtxList(proc);
});

// 图像判废排活
router.get("/api/hecha/task", async ctx => {
  const html = `
    // 因用户信息包含较多查询参数，不支持get请求，请按以下方式发起post调用:
    var url = 'http://${
      !db3.dev ? "localhost:3000" : "10.8.1.27:4000"
    }/api/hecha/task';
    var data = {
        tstart: 20200313,
        tend: 20200320,
        user_list: [{
        //   user_no: '54001793',
        //   user_name: '龚季敏',
        //   work_long_time: 1
        // },
        // {
        //   user_no: '54001789',
        //   user_name: '李小平',
        //   work_long_time: 1
        // },
        // {
          user_no: '54001664',
          user_name: '李鹤玲',
          work_long_time: 1
        },
        {
          user_no: '54001804',
          user_name: '邓丽',
          work_long_time: 1
        },
        {
          user_no: '54001692',
          user_name: '蒙娅',
          work_long_time: 1
        },
        {
          user_no: '54001966',
          user_name: '何莉',
          work_long_time: 1
        },
        // {
        //   user_no: '54001585',
        //   user_name: '何建英',
        //   work_long_time: 1
        // },
        // {
        //   user_no: '54001363',
        //   user_name: '杨亚蓉',
        //   work_long_time: 1
        // },
        // {
        //   user_no: '54001700',
        //   user_name: '张素珍',
        //   work_long_time: 1
        // },
        // {
        //   user_no: '54002137',
        //   user_name: '刘照英',
        //   work_long_time: 1
        // },
        // {
        //   user_no: '54001707',
        //   user_name: '杜希',
        //   work_long_time: 1
        // },
        // {
        //   user_no: '54001656',
        //   user_name: '夏志英',
        //   work_long_time: 1
        // },
        // {
        //   user_no: '54002710',
        //   user_name: '赵川',
        //   work_long_time: 1
        // },
        // {
        //   user_no: '54002159',
        //   user_name: '何媛方',
        //   work_long_time: 1
        // },
        {
          user_no: '54001576',
          user_name: '李晓红',
          work_long_time: 0.9
        }
        ],
        limit: 20000,
        // prod: ['9607T', '9602A','9606T'],
        need_convert: 0,
        precision: 100,
        totalNum: 20000
    };
    /** 
     * 参数说明：limit,prod,need_convert,precision四个参数可以不传。
     * limit表示默认20000条以下参与排活，超过不排活
     * prod:默认全部品种参与排活，指定品种则像demo一样传出品种名
     * precision:每包相差100条时不再遍历
     * need_convert，默认做数据行列转换，不转换时将输出更详细的内容
     *  */
    
    $.ajax({ type: 'POST', url:url, data:data }).done(res => {
        $('#result').html(JSON.stringify(res))
        console.log(res);
        console.log(res.task_list.forEach(item=>console.log(item.prod7)))
    }).fail(e=>{
      console.log(e)
    })
    
    `;

  const content = ` 
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>demo</title>
</head>

<body>
    <h2>调用代码</h2>
    <div>
    ${html}
    </div>
    <h2>输出结果在此：</h2>
    <div id="result">
        数据读取中...
    </div>
    <script src="http://10.8.2.133/assets/global/plugins/jquery.min.js"></script> 
    <script>
        ${html}
    </script>
</body> 
</html> 
  `;
  ctx.body = content;
});

router.post("/api/hecha/task", async ctx => {
  // 使用全局参数校验函数
  let validInfo = util.validateParam(ctx, "tstart,tend,user_list".split(","));
  if (!validInfo.status) {
    ctx.body = validInfo;
    return;
  }

  try {
    ctx.body = await hechaTask(ctx, ctx.request.body);
  } catch (err) {
    ctx.body = { msg: `服务端异常`, status: 500 };
  }
});

// totalNum 人均缺陷条数，默认2W
const hechaTask = async (
  _,
  { tstart, tend, user_list, limit, precision, prod, need_convert,totalnum = 20000 }
) => {
  // 起始日期，用户列表，多少条以内，精度，品种,数据是否需要转换
  limit = limit || 20000;
  precision = precision || 100;
  need_convert = need_convert == "0" ? false : true;

  // 默认全品种
  prod = prod || false;
 
  let data = await db3
    .handleHechaTask({
      tstart,
      tend,
      user_list,
      limit,
      precision,
      prod,
      need_convert,
      totalnum
    })
    .catch(e => {
      throw e;
    });
  return db3.dev
    ? { tstart, tend, user_list, limit, precision, prod, need_convert, ...data }
    : data;
};

// 检封根据开包量排活
router.get("/api/package", async ctx => {
  let data = await dbJianFeng.init(true);
  // ctx.body = data.status
  //   ? data
  //   : {
  //       status: false,
  //       msg: '当前无需排活'
  //     };
  ctx.body = data;
});

module.exports = router;
