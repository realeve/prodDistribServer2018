const R = require('ramda');

const validateParam = (ctx, params) => {
  let { query } = ctx;
  let status = true;
  let param = [];
  query = Object.assign(R.clone(query), ctx.request.body);
  params.forEach((item) => {
    if (R.isNil(query[item])) {
      param.push(item);
      status = false;
    }
  });
  return {
    status,
    msg: `以下参数缺失:${param.join(',')}`
  };
};

module.exports = {
  validateParam
};
