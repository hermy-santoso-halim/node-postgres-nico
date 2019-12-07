var express = require('express');
var cors = require('cors');
var router = express.Router();
var ProductModel = require('../models/product');
var PendingTransModel = require('../models/pending_transaksi');
var TransModel = require('../models/transaksi');
var BiayaModel = require('../models/biaya');
const { Pool } = require('pg');

function makeid(length) {
    var result           = '';
    var characters       = '0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
 
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



router.post('/api/v1/products', (httprequest, httpresponse) => {
    const results = [];
    let paramBody = httprequest.body;
    let offset = (parseInt(paramBody.page) - 1) * parseInt(paramBody.pageLimit);
    let pageLimit = paramBody.pageLimit;
    let totalData =0;
    let platNo =paramBody.platNo;

    pool.connect().then(client => {
        client.query('SELECT count(plat) FROM product where plat like $1',[platNo])
            .then(result => {
                totalData = result.rows[0].count;
                if (totalData < paramBody.pageLimit){
                    pageLimit = totalData;
                }
            })
            .catch(err => {
                console.log(err.stack)
                console.log();
            });
        client.query('SELECT * FROM product where plat like $1 ORDER BY plat ASC LIMIT $2 OFFSET $3',[platNo,pageLimit, offset])
            .then(result => {
                if (result.rowCount > 0) {
                    result.rows.forEach(ele => {
                        let product= new ProductModel(ele.plat, ele.merk, ele.tipe, ele.tahun, ele.pajak, ele.hrg_beli, ele.tgl_beli,ele.image);
                        results.push(product);
                    });
                }
                let returnData ={totalCount:totalData,listData:results};
                httpresponse.setHeader('Content-Type', 'application/json');
                httpresponse.json(returnData);
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

router.post('/api/v1/product', (httprequest, httpresponse) => {
    let paramBody = httprequest.body;
    let product = new ProductModel(paramBody.plat, paramBody.merk, paramBody.tipe, paramBody.tahun, paramBody.pajak, paramBody.hrg_beli, paramBody.tgl_beli, paramBody.image);

    pool.connect().then(client => {
        client.query('insert into product ("plat","merk", "tipe", "tahun", "pajak" ,"hrg_beli", "tgl_beli","image") values ($1,$2,$3,$4,$5,$6,$7,$8)',
            [product.plat, product.merk, product.tipe, product.tahun, product.pajak, product.hrg_beli, product.tgl_beli,product.image])
            .then(result => {
                let descTrx = "PEMBELIAN MOTOR PLAT NO : ".concat(product.plat).concat(":::Tipe : ").concat(product.tipe).concat(" ").concat(product.merk);
                if (paramBody.settle) {
                    //masuk transaction
                    let transaksi = new TransModel(product.tgl_beli, descTrx, product.hrg_beli);
                    client.query('insert into transaksi ("tgl","jmlh", "keterangan") values ($1,$2,$3)',
                        [transaksi.tanggal, transaksi.jumlah, transaksi.keterangan])
                        .then(result => { console.log('success insert trx') }).catch(err => {console.log('failed insert trx'); console.log(err) });
                } else {
                    // masuk pending transaction
                    let pendingTransaction = new PendingTransModel(product.tgl_beli,
                        product.hrg_beli,descTrx
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

router.post('/api/v1/product/biaya', (httprequest, httpresponse) => {
    let paramBody = httprequest.body;
    var date = new Date();

    let biaya = new BiayaModel(makeid(5), paramBody.nama, paramBody.harga, date, paramBody.grup_biaya);
    let descCost = "BIAYA TAMBAHAN : ".concat(biaya.nama).concat(":::Tipe Biaya : ").concat(biaya.grup_biaya);
    pool.connect().then(client => {
        client.query('insert into biaya ("id_biaya","nama", "harga", "tgl_beli","grup_biaya") values ($1,$2,$3,$4,$5)',
            [biaya.id, biaya.nama, biaya.harga, biaya.tgl_trans, biaya.grup_biaya])
            .then(result => {  
                if (paramBody.settle) {
                    //masuk transaction
                    let transaksi = new TransModel(biaya.tgl_trans, descCost, biaya.harga);
                    client.query('insert into transaksi ("tgl","jmlh", "keterangan") values ($1,$2,$3)',
                        [transaksi.tanggal, transaksi.jumlah, transaksi.keterangan])
                        .then(result => { console.log('success insert trx') }).catch(err => {console.log('failed insert trx'); console.log(err) });
                } else {
                    // masuk pending transaction
                    let pendingTransaction = new PendingTransModel(biaya.tgl_trans, biaya.harga,descCost);
                    client.query('insert into pending_transaksi ("tgl","jmlh", "keterangan") values ($1,$2,$3)',
                        [pendingTransaction.tgl, pendingTransaction.jmlh, pendingTransaction.keterangan])
                        .then(result => { console.log('success insert pending trx') }).catch(err => {console.log('failed insert pending trx'); console.log(err) });
                }
                httpresponse.status(200);
                httpresponse.json({ success: true });
        })
            .catch(err => {
                httpresponse.status(500);
                httpresponse.json({ success: false });
        });            
    });
});

module.exports = router;