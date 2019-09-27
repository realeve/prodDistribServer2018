const { axios, getTokenFromUrl } = require('./axios');

test('axios 传入数组参数', async () => {
  let res = await axios({
    url: 'http://10.8.1.25:100/api/3/e4e497e849',
    data: {
      t: []
    }
  });
  expect(res.rows).toBeGreaterThan(20);
});

test('axios 报错', () => {
  // expect.assertions(1);
  return expect(
    axios({ url: 'http://10.8.1.25:100/api/21/nononcer' })
  ).resolves.toMatchObject({ errmsg: 'invalid api id' });
});

test('token 获取', () => {
  return getTokenFromUrl().then((res) => {
    expect(typeof res.token).toBe('string');
    expect(res.token).toContain('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9');
  });
});
