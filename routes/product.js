var express = require('express');
var cors = require('cors');
var router = express.Router();
var ProductModel = require('../models/product');
var PendingTransModel = require('../models/pending_transaksi');
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



router.get('/api/v1/products/:page/:pageLimit', (httprequest, httpresponse) => {
    const results = [];
    let paramBody = httprequest.params;
    let offset = (parseInt(paramBody.page) - 1) * parseInt(paramBody.pageLimit);
    pool.connect().then(client => {
        client.query('SELECT * FROM product ORDER BY plat ASC LIMIT '.concat(paramBody.pageLimit).concat(' OFFSET ').concat(offset))
            .then(result => {
                if (result.rowCount > 0) {
                    result.rows.forEach(ele => {
                        let product= new ProductModel(ele.plat, ele.merk, ele.tipe, ele.tahun, ele.pajak, ele.hrg_beli, ele.tgl_beli);
                        results.push(product);
                    });
                }
                httpresponse.setHeader('Content-Type', 'application/json');
                httpresponse.json(results);
                client.release();
            })
            .catch(err => {
                client.release();
                console.log(err.stack)
                console.log();
            });
    });
});

router.get('/api/v1/product/:plat', (httprequest, httpresponse) => {
    let paramBody = httprequest.params;
    console.log(paramBody.plat);

    pool.connect().then(client => {
        client.query('SELECT * FROM product where plat like $1', [paramBody.plat])
            .then(result => {
                if (result.rowCount > 0) {
                    httpresponse.setHeader('Content-Type', 'application/json');
                    let ele = result.rows[0];
                    let product= new ProductModel(ele.plat, ele.merk, ele.tipe, ele.tahun, ele.pajak, ele.hrg_beli, ele.tgl_beli);
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

router.post('/api/v1/product', (httprequest, httpresponse) => {
    let paramBody = httprequest.body;
    let product = new ProductModel(paramBody.plat, paramBody.merk, paramBody.tipe, paramBody.tahun, paramBody.pajak, paramBody.hrg_beli, paramBody.tgl_beli, paramBody.image);

    pool.connect().then(client => {
        client.query('insert into product ("plat","merk", "tipe", "tahun", "pajak" ,"hrg_beli", "tgl_beli","image") values ($1,$2,$3,$4,$5,$6,$7,$8)',
            [product.plat, product.merk, product.tipe, product.tahun, product.pajak, product.hrg_beli, product.tgl_beli,product.image])
            .then(result => {
                if (paramBody.settle) {
                    //masuk transaction
                } else {
                    // masuk pending transaction
                    let pendingTransaction = new PendingTransModel(paramBody.tgl_beli,
                        paramBody.hrg_beli,
                        "PEMBELIAN MOTOR PLAT NO : ".concat(paramBody.plat).concat("\nTipe : ").concat(paramBody.tipe).concat(" ").concat(paramBody.merk)
                    );
                    client.query('insert into pending_transaksi ("tgl","jmlh", "keterangan") values ($1,$2,$3)',
                        [pendingTransaction.tgl, pendingTransaction.jmlh, pendingTransaction.keterangan])
                        .then(result => { console.log('success insert pending trx') }).catch(err => {console.log('failed insert pending trx'); console.log(err) });
                }
                httpresponse.status(200);
                httpresponse.json({ success: true });
            })
            .catch(err => {
                console.log(err.stack)
                httpresponse.status(500);
                httpresponse.json({ success: false });
            });
    });

});


router.post('/api/v1/productUpdate', (httprequest, httpresponse) => {
    let paramBody = httprequest.body;
});


module.exports = router;