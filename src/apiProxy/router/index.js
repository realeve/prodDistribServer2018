const Router = require('koa-router');
const router = new Router();
const util = require('./util');
const db = require('./db');
const lib = require('../../util/lib');
const api_doc = require('./api_document');
const users = require('../../util/rtx');
const R = require('ramda');
const rtx = require('../rtx/index');
const db2 = require('../../util/db');
const db3 = require('./db_hecha');

router.get('/', ctx => {
    ctx.body = 'hello worlds';
});

router.get('/api', ctx => {
    ctx.body = api_doc;
});

// 产品指定车号锁车日志
router.get('/api/remark_info', async ctx => {
    let validInfo = util.validateParam(ctx, ['cart']);
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
router.get('/api/manual_status', async ctx => {
    let validInfo = util.validateParam(ctx, ['cart']);
    if (!validInfo.status) {
        ctx.body = validInfo;
        return;
    }

    let { cart, update_machine } = ctx.query;
    if (typeof update_machine == 'undefined') {
        update_machine = 1;
    }
    update_machine = update_machine == '0' ? false : true;
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
router.get('/api/after_print', async ctx => {
    let validInfo = util.validateParam(ctx, 'process,status,cart'.split(','));
    if (!validInfo.status) {
        ctx.body = validInfo;
        return;
    }

    let { process, status, cart } = ctx.query;
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
    let data = { dataNewProc, dataAbnormal, dataMultiweak };
    data.status = true;
    ctx.body = data;
});

// 连续废通知
router.get('/api/multiweak', async ctx => {
    let validInfo = util.validateParam(ctx, ['cart']);
    if (!validInfo.status) {
        ctx.body = validInfo;
        return;
    }

    let { cart } = ctx.query;
    let data = await db.getPrintMachinecheckMultiweak(cart);
    data.status = true;
    ctx.body = data;
});

// 上机前通知接口
router.get('/api/before_print', async ctx => {
    let validInfo = util.validateParam(
        ctx,
        'process,machine_name,cart'.split(',')
    );
    if (!validInfo.status) {
        ctx.body = validInfo;
        return;
    }

    let { process, machine_name, cart } = ctx.query;

    // 检封工序上机需要更新wms车号调整列表中的领用情况
    if (process == '检封') {
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

    ctx.body = data;
});

// 获取指定用户的rtx信息
router.get('/api/user/:uid', async ctx => {
    let { uid } = ctx.params;
    ctx.body = {
        status: true,
        data: R.filter(R.propEq('username', uid))(users)
    };
});

// 根据工序名称获取待推送人员名单rtx信息
router.get('/api/rtxlist/:proc', async ctx => {
    let { proc } = ctx.params;
    ctx.body = rtx.getRtxList(proc);
});

// 图像判废排活
router.get('/api/hecha/task', async ctx => {
    const html = `
    // 因用户信息包含较多查询参数，不支持get请求，请按以下方式发起post调用:
    var url = 'http://10.8.1.27:4000/api/hecha/task';
    var data = {
        tstart: 20181101,
        tend: 20181101,
        user_list: [{
                user_no: '54002137',
                user_name: '刘照英',
                work_long_time: 0.5
            },
            {
                user_no: '54001707',
                user_name: '杜希',
                work_long_time: 0.625
            },
            {
                user_no: '54001656',
                user_name: '夏志英',
                work_long_time: 0.775
            },
            {
                user_no: '54002710',
                user_name: '赵川',
                work_long_time: 1
            },
            {
                user_no: '54002159',
                user_name: '何媛方',
                work_long_time: 0.825
            },
            {
                user_no: '54001576',
                user_name: '李晓红',
                work_long_time: 0.4
            }
        ],
        limit: 20000,
        prod: ['9607T', '9602A'],
        need_convert: 1,
        precision: 100
    };
    /** 
     * 参数说明：limit,prod,need_convert,precision四个参数可以不传。
     * limit表示默认20000条以下参与排活，超过不排活
     * prod:默认全部品种参与排活，指定品种则像demo一样传出品种名
     * precision:每包相差100条时不再遍历
     * need_convert，默认做数据行列转换，不转换时将输出更详细的内容
     *  */
    
    $.ajax({ method: 'POST', url:url, data:data }).done(res => {
        console.log(res)
    })
    
    `
    ctx.body = html;
});

router.post('/api/hecha/task', async ctx => {
    let { tstart, tend, user_list } = ctx.request.body;
    if (typeof tstart == 'undefined') {
        ctx.body = 'tstart参数必须传入，示例：20181102';
        return;
    }
    if (typeof tend == 'undefined') {
        ctx.body = 'tend参数必须传入，示例：20181102';
        return;
    }
    if (typeof user_list == 'undefined') {
        ctx.body = 'user_list参数必须传入，默认为数组类型';
        return;
    }
    ctx.body = await hechaTask(ctx, ctx.request.body);
});

const hechaTask = async(ctx, { tstart, tend, user_list, limit, precision, prod, need_convert }) => {
    // 起始日期，用户列表，多少条以内，精度，品种,数据是否需要转换
    limit = limit || 20000;
    precision = precision || 100;
    need_convert = need_convert == '0' ? false : true;

    // 默认全品种
    prod = prod || false;

    let data = await db3.handleHechaTask({ tstart, tend, user_list, limit, precision, prod, need_convert });
    return db3.dev ? { tstart, tend, user_list, limit, precision, prod, need_convert, ...data } : data;
}
module.exports = router;