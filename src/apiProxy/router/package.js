const R = require('ramda');
const { dev } = require('../../util/axios');
const db = require('./db_package');

const init = async({ tstart, tend }) => {
    let { data } = await db.getVwWimWhitelist();
    data = data.map(({ gh, prodname, carno, idx, review, lock_reason }) => {
        idx = parseInt(idx, 10);
        return {
            gh,
            prodname,
            carno,
            idx,
            review,
            lock_reason
        }
    });
    return data;
}

module.exports.dev = dev;
module.exports.init = init;