let users = require('./users');
let depts = require('./depts');
let R = require('ramda');

users = users.map(user => {
  user.dept_name = R.compose(R.prop('dept_name'), R.find(R.propEq('dept_id', user.dept_id)))(depts);
  user.gender = user.gender == '0' ? '男' : "女"
  return user;
})

module.exports = users