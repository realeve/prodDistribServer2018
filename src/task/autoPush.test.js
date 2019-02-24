const lib = require('./autoPush');
const moment = require('moment');
test('时间测试', () => {
  console.log(moment().format('dddd'));
  expect(lib.getWeekEnd('星期二')).toBeTruthy();
  expect(lib.getWeekEnd('星期日')).toBeFalsy();
  expect(lib.isWorkTime(734)).toBeFalsy();
  expect(lib.isWorkTime(601)).toBeTruthy();
});

test('文本分析', () => {
  let str = '1、换三块压印，换辊子一根。换三色色模。已清场，无xxx遗留。';
  let res = lib.splitWord(str);

  console.warn(res);
  expect(res).toContain(`<strong color=`);

  str = '1、换三块压印，换辊子一根。换三色印版。已清场，无xxx遗留。';
  res = lib.splitWord(str);
  console.warn(res);
  expect(res).toContain(`<strong color=`);

  str = '1、换三块压印，换辊子一根。换三色印版。已清场，无xxx遗留。';
  res = lib.splitWord(str);
  console.warn(res);
  expect(res).toContain(`<strong color=`);

  str = '1、换三块压印，换辊子一根。修三色印版。已清场，无xxx遗留。';
  res = lib.splitWord(str);
  console.warn(res);
  expect(res).toContain(`<strong color=`);

  str =
    '1、换三块压印，换辊子一根。修三色印版。已清场，无xxx遗留。测试电工说。';
  res = lib.splitWord(str);
  console.warn(res);
  expect(res).toContain(`<strong color=`);

  str =
    '1、换三块压印，换辊子一根。修三色印版。已清场，无xxx遗留。测试钳工说。';
  res = lib.splitWord(str);
  console.warn(res);
  expect(res).toContain(`<strong color=`);

  str = '1、无xxx遗留。测试没有关键字信息。';
  res = lib.splitWord(str);
  console.warn(res);
  expect(res).not.toContain(`<strong color=`);
});

test('html内容获取', async () => {
  let html = await lib.getHtml();
  console.log(html);
  expect(html).toContain('blockquote');

  let res = await lib.publishArticle(html);
  // console.log(res);
  expect(res.receiver).toContain('10654');
});
