const db = require('./db_sync_noteAnay.js');

db.getCartInfoByGZ({ prod: '9606T', code: 'FE3686', kilo: '3' }).then((res) => {
  console.log(res);
});
