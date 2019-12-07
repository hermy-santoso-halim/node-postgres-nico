var express = require('express');
var cors = require('cors');
var router = express.Router();
var PendingTransModel = require('../models/pending_transaksi');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'pczkdkvxgizjtj',
    host: 'ec2-54-221-238-248.compute-1.amazonaws.com',
    database: 'dbq8hmkuq8ait0',
    password: '4428eb4b0ba9ba0568cbf95bdbcf247fc186f3ad81cfdced2685daa09ba9e46d',
    port: 5432,
    ssl: true
})

router.use(cors({
    origin: '*'
}));

router.get('/echo', (httprequest, httpresponse) => {
    httpresponse.status(200);
    httpresponse.json({ success: true });
})

router.get('/api/v1/pendingtrxs/:page/:pageLimit', (httprequest, httpresponse) => {
    const results = [];
    let paramBody = httprequest.params;
    let offset = (parseInt(paramBody.page) - 1) * parseInt(paramBody.pageLimit);
    pool.connect().then(client => {
        client.query('SELECT * FROM pending_transaksi ORDER BY tanggal ASC LIMIT '.concat(paramBody.pageLimit).concat(' OFFSET ').concat(offset))
            .then(result => {
                if (result.rowCount > 0) {
                    result.rows.forEach(element => {
                        let pendingTransaction = new PendingTransModel(element.tanggal,
                            element.keterangan,element.jumlah, element.id_pendingtrans
                        );

                        results.push(pendingTransaction);
                    });
                }
                httpresponse.setHeader('Content-Type', 'application/json');
                httpresponse.json(results);
                client.release();
            })
            .catch(err => {
                client.release();
                console.log(err.stack)
            });
    });
});
  

module.exports = router;