let R = require('ramda');
let db = require('../util/db_excellentProdLine');
let lib = require('../util/lib');
let moment = require('moment');
let wms = require('../util/wms');
let { addPrintWmsLog, setPrintWmsLog } = require('../util/db');
// 开始智能精品线处理逻辑

/**
胶印完工，未印码产品
with carts as (select distinct 车号 from v_cbpc_cartlist where 工序='胶印' and 品种='9607T' and 机长 in ('廖其武','刘勇明')),
carts_code as (select 车号 from v_cbpc_cartlist where 车号 in (select * from carts) and 工序='印码')
select * from carts where 车号 not in (select * from carts_code)

胶印精品
update udt_tb_WipInventory set IsRemoveBarrier=1 where carNo in ('1980A398','1980A590','1980A625','1980A635','1980A636','1980A652','1980A653','1980A659','1980A675','1980A680','1980A681','1980A686','1980A689','1980A698','1980A699','1980A703','1980A708','1980A724','1980A729','1980A747','1980A756','1980A773','1980A774','1980A776','1980A794','1980A807','1980A808','1980A811','1980A820','1980A823','1980A827','1980A830','1980A833','1980A838','1980A845','1980A846','1980A847','1980A854','1980A856','1980A864','1980A866','1980A869','1980A878','1980A880','1980A881','1980A882','1980A883','1980A884','1980A885','1980A893','1980A896','1980A900','1980A903','1980A907','1980A922','1980A923','1980A926','1980A927','1980A933','1980A937','1980A940','1980A941','1980A944','1980A946','1980A948','1980A952','1980A953','1980A956','1980A957','1980A958','1980A975','1980A980','1980A985','1980A986','1980A987','1980A989','1980A994','1980B003','1980B004','1980B005','1980B009','1980B018','1980B033','1980B034','1980B036','1980B038','1980B040','1980B042','1980B043','1980B044','1980B045','1980B048','1980B050','1980B054','1980B058','1980B083','1980B084','1980B085','1980B091','1980B092','1980B094','1980B096','1980B098','1980B100','1980B102','1980B105','1980B107','1980B110','1980B120','1980B123','1980B130','1980B132','1980B133','1980B134','1980B135','1980B142','1980B145','1980B146','1980B147','1980B148','1980B149','1980B150','1980B151','1980B155','1980B173','1980B175','1980B178','1980B185','1980B192','1980B194','1980B196','1980B197','1980B198','1980B201','1980B203','1980B211','1980B216','1980B219','1980B224','1980B225','1980B232','1980B234','1980B238','1980B246','1980B253','1980B254','1980B261','1980B264','1980B265','1980B267','1980B279','1980B285','1980B286','1980B287','1980B288','1980B298','1980B300','1980B305','1980B306','1980B307','1980B310','1980B311','1980B312','1980B313','1980B315','1980B319','1980B324','1980B325','1980B328','1980B335','1980B338','1980B340','1980B344','1980B352','1980B360','1980B364','1980B367','1980B371','1980B374','1980B376','1980B377','1980B379','1980B381','1980B382','1980B383','1980B385','1980B390','1980B398','1980B400','1980B403','1980B404','1980B405','1980B409','1980B413','1980B414','1980B416','1980B420','1980B422','1980B423','1980B427','1980B428','1980B429','1980B435','1980B436','1980B437','1980B438','1980B443','1980B454','1980B463','1980B465','1980B468','1980B469','1980B471','1980B472','1980B473','1980B475','1980B480','1980B481','1980B485','1980B487','1980B496','1980B498','1980B501','1980B503','1980B506','1980B514','1980B516','1980B519','1980B520','1980B524','1980B527','1980B528','1980B529','1980B530','1980B532','1980B543','1980B553','1980B555','1980B557','1980B558','1980B573','1980B578','1980B579','1980B584','1980B592','1980B594','1980B595','1980B596','1980B597','1980B608','1980B609','1980B614','1980B617','1980B621','1980B625','1980B626','1980B627','1980B631','1980B635','1980B637','1980B640','1980B655','1980B662','1980B664','1980B666','1980B669','1980B670','1980B675','1980B680','1980B681','1980B685','1980B687','1980B689','1980B690','1980B692','1980B694','1980B704','1980B707','1980B711','1980B714','1980B719','1980B740','1980B741','1980B750','1980B753','1980B758','1980B759','1980B769','1980B772','1980B777','1980B800','1980B802','1980B820','1980B824','1980B826','1980B829','1980B830','1980B832','1980B840','1980B854','1980B865','1980B867','1980B870','1980B874','1980B882','1980B885','1980B889','1980B890','1980B891','1980B904','1980B906','1980B913','1980B918','1980B935','1980B937','1980B940','1980B946','1980B953','1980B966','1980B974','1980B976','1980B977','1980B981','1980B994','1980B999','1980C002','1980C005','1980C013','1980K079','1980K084','1980K133','1980K134','1980K137','1980K142')
 

凹一印
select distinct 车号 from v_cbpc_cartlist where 工序='凹一印' and 机长 in ('况东','张鹏') and 车号  in (
'1980A398','1980A590','1980A625','1980A635','1980A636','1980A652','1980A653','1980A659','1980A675','1980A680','1980A681','1980A686','1980A689','1980A698','1980A699','1980A703','1980A708','1980A724','1980A729','1980A747','1980A756','1980A773','1980A774','1980A776','1980A794','1980A807','1980A808','1980A811','1980A820','1980A823','1980A827','1980A830','1980A833','1980A838','1980A845','1980A846','1980A847','1980A854','1980A856','1980A864','1980A866','1980A869','1980A878','1980A880','1980A881','1980A882','1980A883','1980A884','1980A885','1980A893','1980A896','1980A900','1980A903','1980A907','1980A922','1980A923','1980A926','1980A927','1980A933','1980A937','1980A940','1980A941','1980A944','1980A946','1980A948','1980A952','1980A953','1980A956','1980A957','1980A958','1980A975','1980A980','1980A985','1980A986','1980A987','1980A989','1980A994','1980B003','1980B004','1980B005','1980B009','1980B018','1980B033','1980B034','1980B036','1980B038','1980B040','1980B042','1980B043','1980B044','1980B045','1980B048','1980B050','1980B054','1980B058','1980B083','1980B084','1980B085','1980B091','1980B092','1980B094','1980B096','1980B098','1980B100','1980B102','1980B105','1980B107','1980B110','1980B120','1980B123','1980B130','1980B132','1980B133','1980B134','1980B135','1980B142','1980B145','1980B146','1980B147','1980B148','1980B149','1980B150','1980B151','1980B155','1980B173','1980B175','1980B178','1980B185','1980B192','1980B194','1980B196','1980B197','1980B198','1980B201','1980B203','1980B211','1980B216','1980B219','1980B224','1980B225','1980B232','1980B234','1980B238','1980B246','1980B253','1980B254','1980B261','1980B264','1980B265','1980B267','1980B279','1980B285','1980B286','1980B287','1980B288','1980B298','1980B300','1980B305','1980B306','1980B307','1980B310','1980B311','1980B312','1980B313','1980B315','1980B319','1980B324','1980B325','1980B328','1980B335','1980B338','1980B340','1980B344','1980B352','1980B360','1980B364','1980B367','1980B371','1980B374','1980B376','1980B377','1980B379','1980B381','1980B382','1980B383','1980B385','1980B390','1980B398','1980B400','1980B403','1980B404','1980B405','1980B409','1980B413','1980B414','1980B416','1980B420','1980B422','1980B423','1980B427','1980B428','1980B429','1980B435','1980B436','1980B437','1980B438','1980B443','1980B454','1980B463','1980B465','1980B468','1980B469','1980B471','1980B472','1980B473','1980B475','1980B480','1980B481','1980B485','1980B487','1980B496','1980B498','1980B501','1980B503','1980B506','1980B514','1980B516','1980B519','1980B520','1980B524','1980B527','1980B528','1980B529','1980B530','1980B532','1980B543','1980B553','1980B555','1980B557','1980B558','1980B573','1980B578','1980B579','1980B584','1980B592','1980B594','1980B595','1980B596','1980B597','1980B608','1980B609','1980B614','1980B617','1980B621','1980B625','1980B626','1980B627','1980B631','1980B635','1980B637','1980B640','1980B655','1980B662','1980B664','1980B666','1980B669','1980B670','1980B675','1980B680','1980B681','1980B685','1980B687','1980B689','1980B690','1980B692','1980B694','1980B704','1980B707','1980B711','1980B714','1980B719','1980B740','1980B741','1980B750','1980B753','1980B758','1980B759','1980B769','1980B772','1980B777','1980B800','1980B802','1980B820','1980B824','1980B826','1980B829','1980B830','1980B832','1980B840','1980B854','1980B865','1980B867','1980B870','1980B874','1980B882','1980B885','1980B889','1980B890','1980B891','1980B904','1980B906','1980B913','1980B918','1980B935','1980B937','1980B940','1980B946','1980B953','1980B966','1980B974','1980B976','1980B977','1980B981','1980B994','1980B999','1980C002','1980C005','1980C013','1980K079','1980K084','1980K133','1980K134','1980K137','1980K142'
)

凹二印
select distinct 车号 from v_cbpc_cartlist where 工序='凹二印' and 机长 in ('廖大为','蔡勇') and 车号  in (
'1980A635','1980A680','1980A703','1980A747','1980A827','1980A878','1980A880','1980A896','1980A907','1980A923','1980A933','1980B038','1980B040','1980B054','1980B084','1980B107','1980B149','1980B198','1980B211','1980B265')

update udt_tb_WipInventory set IsRemoveBarrier=4 where carNo in (
'1980A703',
'1980A923')

 */

// 增加下机逻辑处理，只处理将胶印产品置为精品
// module.exports.init = async () => {
//   let prod = '9607T';

//   // 获取精品生产机台
//   let { data: excellentProdLine } = await db.getUdtPsExchange(prod);
//   let captainList = R.map(R.prop('captain_name'))(excellentProdLine);

//   let { data: cartList } = await getVCbpcCartlistYesterday();

//   // 记录胶印原始状态(将车号置为唯一索引)
//   await db.addPrintMesExcellentProdline({
//     cart_number: cart,
//     offset_back: 1,
//     offset_front: 1
//     // 此处需修改接口，全部置为1,
//     // 添加是否完成判断的状态字段
//   });
// };

const filterCartsByProc = (proc, carts) =>
  R.compose(
    R.map(R.prop('cart_number')),
    R.filter(R.propEq('process', proc))
  )(carts);

// 同步，凌晨处理前一个工作日大张废超标，
// 修停换异常，丝印实废过多三种场景。
module.exports.sync = async () => {
  // 是否需要记录
  let curHour = parseInt(moment().format('HHMM'), 10);
  // 凌晨2点处理该任务
  console.log(curHour);
  if (curHour > 9059 || curHour < 200) {
    console.log('无需处理精品线记录');
    return;
  }

  // 当天是否已记录
  let { rows } = await db.getPrintMesExcellentProdline();
  if (rows > 0) {
    console.log('无需处理，当天已记录');
    return;
  }

  //
  let logInfo = {
    carts: 0, //车号总数
    allcheck: 0, //转全检
    exchange: 0, //换票超标
    print_time_length: 0, //印刷不畅
    excellent: 0, //精品
    mahou: 0 //转码后
  };

  // 处理7T品
  let prod = '9607T';
  console.log('开始智能精品线处理逻辑');

  // 昨日生产车号列表,确认是否有工序名称(当前精品标志，是否超时生产，需要设置的目标字段)
  let { data: cartList } = await db.getVCbpcCartlistYesterday();

  // 测试模式指定日期
  // let { data: cartList } = await db.getVCbpcCartlistByDates({
  //   tstart: '20190404',
  //   tend: '20190404'
  // });

  // 转换获取为车号数组
  let carts = R.map(R.prop('cart_number'))(cartList);

  // 1.精品线_单工序换票数是否大于3张
  let { data: handledList } = await db.getQmRectifyMaster(carts);
  let cartsChanged = R.map(R.prop('cart_number'))(handledList);

  // 回写cartList,将其中换票异常的置为全检
  cartList = cartList.map((item) => {
    if (cartsChanged.includes(item.cart_number)) {
      item.all_check = '1';
    }
    return item;
  });

  // 2.精品线_丝印机台作废超阈值(当日生产完毕的丝印产品，判废未完成前该逻辑无意义)
  // let yesterday = moment()
  //   .subtract(1, 'days')
  //   .format('YYYYMMDD');
  // let { data: res3 } = await db.getQaRectifyMasterByDate('20190404');
  // 丝印产品在领用出库变更为全检工艺，在生产列表中已排除

  // 状态标志位回写为胶印(n-1，当前为2置为1，当前为1置为0)。max(0,n-1)

  // 合并1、2、3的车号列表，统一置为非精品,此处调用接口
  logInfo.carts = cartList.length;

  // 将对应车号置为全检，原因为非精品异常信息
  let allCheckList = R.compose(
    R.map(R.prop('cart_number')),
    R.filter(R.propEq('all_check', '1'))
  )(cartList);

  // console.log('置全检车号', [...cartsChanged, ...allCheckList].length);
  // console.log('其中1.换票', cartsChanged.length);
  // console.log('2.生产不顺畅', allCheckList.length);

  logInfo.print_time_length = allCheckList.length;

  allCheckList = [...cartsChanged, ...allCheckList];
  logInfo.allcheck = allCheckList.length;
  logInfo.exchange = cartsChanged.length;
  // 可能符合条件的精品线车号列表

  // 获取精品生产机台
  let { data: excellentProdLine } = await db.getUdtPsExchange(prod);
  let captainList = R.map(R.prop('captain_name'))(excellentProdLine);

  // 筛选精品机台生产产品
  let ExcellentList = R.compose(
    R.filter((item) => captainList.includes(item.captain_name)), // 精品机台生产的产品
    R.reject((item) => allCheckList.includes(item.cart_number)) // 去除全检车号(置异常)
  )(cartList);
  // console.log('可能符合条件的精品线车号列表', ExcellentList.length);

  // 需要置标记的车号
  ExcellentList = R.filter(
    (item) => item.proc_status - item.proc_status_before == 1
  )(ExcellentList);
  logInfo.excellent = ExcellentList.length;
  // console.log('置标记的车号', ExcellentList);

  // 筛选凹二印
  let mahouCarts = filterCartsByProc('凹二印', ExcellentList);
  logInfo.mahou = mahouCarts.length;
  // 精品置为码后核查工艺;

  // 后续处理
  // 1.转全检
  let result = false;
  if (allCheckList.length) {
    let logInfo = await addPrintWmsLog([
      {
        remark: JSON.stringify(allCheckList),
        rec_time: lib.now()
      }
    ]);

    // 添加日志正常？
    if (logInfo.rows < 1 || logInfo.data[0].affected_rows < 1) {
      console.log('wms记录失败', logInfo);
      return false;
    }

    let log_id = logInfo.data[0].id;
    result = await wms.setProcs({
      carnos: allCheckList,
      checkType: '全检品',
      log_id
    });
    await setPrintWmsLog({ return_info: JSON.stringify(result), _id: log_id });
    await db.addPrintWmsAutoproc(
      allCheckList.map((cart) => ({
        cart,
        rec_time: lib.now(),
        remark: '智能精品线转全检品'
      }))
    );
  }

  // Test_setUdtTbWipinventory 使用测试环境
  // setUdtTbWipinventory 使用线上正式环境

  // 2.转码后
  if (mahouCarts.length) {
    // 置精品
    db.Test_setUdtTbWipinventory({ isremovebarrier: 4, carno: mahouCarts });

    let logInfo = await addPrintWmsLog([
      {
        remark: JSON.stringify(mahouCarts),
        rec_time: lib.now()
      }
    ]);

    // 添加日志正常？
    if (logInfo.rows < 1 || logInfo.data[0].affected_rows < 1) {
      console.log('wms记录失败', logInfo);
      return false;
    }

    result = await wms.setProcs({
      carnos: mahouCarts,
      checkType: '码后核查',
      log_id
    });
    await setPrintWmsLog({ return_info: JSON.stringify(result), _id: log_id });
    await db.addPrintWmsAutoproc(
      mahouCarts.map((cart) => ({
        cart,
        rec_time: lib.now(),
        remark: '智能精品线转全检品'
      }))
    );
  }

  // 3.置精品
  let cartsOffset = filterCartsByProc('胶印', ExcellentList);
  if (cartsOffset.length) {
    db.Test_setUdtTbWipinventory({ isremovebarrier: 1, carno: cartsOffset });
  }
  let cartsSilk = filterCartsByProc('丝印', ExcellentList);
  if (cartsSilk.length) {
    db.Test_setUdtTbWipinventory({ isremovebarrier: 2, carno: cartsSilk });
  }
  let cartsItgBack = filterCartsByProc('凹一印', ExcellentList);
  if (cartsItgBack.length) {
    db.Test_setUdtTbWipinventory({ isremovebarrier: 3, carno: cartsItgBack });
  }

  console.log(JSON.stringify(logInfo));
  // 4.记录日志
  db.addPrintMesExcellentProdline({
    rec_time: lib.now(),
    remark: JSON.stringify(logInfo)
  });
  console.log('智能精品线处理完毕');
  return;
};
