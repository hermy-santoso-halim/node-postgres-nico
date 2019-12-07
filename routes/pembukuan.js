var express = require('express');
var cors = require('cors');
var router = express.Router();
var TransModel = require('../models/transaksi');
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

router.get('/api/v1/product/:plat', (httprequest, httpresponse) => {
    let paramBody = httprequest.params;
    console.log(paramBody.plat);

    pool.connect().then(client => {
        client.query('SELECT * FROM product where plat like $1', [paramBody.plat])
            .then(result => {
                if (result.rowCount > 0) {
                    httpresponse.setHeader('Content-Type', 'application/json');
                    let ele = result.rows[0];
                    let product= new ProductModel(ele.plat, ele.merk, ele.tipe, ele.tahun, ele.pajak, ele.hrg_beli, ele.tgl_beli, ele.image);
                    httpresponse.json(product);
                }
                client.release();
            })
            .catch(err => {
                client.release();
                console.log(err.stack)
            });
    });
});

module.exports = router;