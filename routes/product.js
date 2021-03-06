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
                        let product= new ProductModel(ele.plat, ele.merk, ele.tipe, ele.tahun, ele.pajak, ele.hrg_beli, ele.tgl_beli,ele.image,ele.status_jual, ele.harga_jual, ele.tgl_jual, ele.pembeli);
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

router.post('/api/v1/getproduct', (httprequest, httpresponse) => {
    let paramBody = httprequest.body;
    let listBiaya=[];
    let product;

    console.log(paramBody);
    pool.connect().then(client => {
        client.query('SELECT * FROM product where plat = $1', [paramBody.plat])
            .then(result => {
                if (result.rowCount > 0) {  
                    let ele = result.rows[0];
                    product= new ProductModel(ele.plat, ele.merk, ele.tipe, ele.tahun, ele.pajak, ele.hrg_beli, ele.tgl_beli, ele.image,ele.status_jual, ele.hrg_jual, ele.tgl_jual, ele.pembeli);
                    product.listBiaya =[];
                    client.query('SELECT * FROM biaya where grup_biaya = $1', [product.plat])
                    .then(resultBiaya => {
                        if (resultBiaya.rowCount > 0) {
                            resultBiaya.rows.forEach(ele => {
                                let biaya= new BiayaModel(ele.nama,ele.harga,ele.tgl_trans);
                                listBiaya.push(biaya);
                            });
                            product.listBiaya = listBiaya;
                        }
                        httpresponse.status(200);
                        httpresponse.json(product);
                    })
                    .catch(err=>{
                        console.log(err.stack);
                        httpresponse.status(500);
                        httpresponse.json({});
                    });
                } else {
                    httpresponse.status(500);
                    httpresponse.json({});
                }
            })
            .catch(err => {
                console.log(err.stack);
                httpresponse.status(500);
                httpresponse.json({});
            });
    });
});

router.post('/api/v1/product', (httprequest, httpresponse) => {
    let paramBody = httprequest.body;
    let product = new ProductModel(paramBody.plat, paramBody.merk, paramBody.tipe, paramBody.tahun, paramBody.pajak, paramBody.hrg_beli, paramBody.tgl_beli, paramBody.image,false);

    pool.connect().then(client => {
        client.query('insert into product ("plat","merk", "tipe", "tahun", "pajak" ,"hrg_beli", "tgl_beli","image","status_jual") values ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
            [product.plat, product.merk, product.tipe, product.tahun, product.pajak, product.hrg_beli, product.tgl_beli,product.image, product.status_jual])
            .then(result => {
                let descTrx = "PEMBELIAN MOTOR PLAT NO : ".concat(product.plat).concat(":::Tipe : ").concat(product.tipe).concat(" ").concat(product.merk);
                if (paramBody.settle) {
                    //masuk transaction

                    let transaksi = new TransModel(product.tgl_beli, descTrx, product.hrg_beli);
                    client.query('insert into transaksi ("tanggal","jumlah", "keterangan","kode_transaksi") values ($1,$2,$3,$4)',
                        [transaksi.tanggal, transaksi.jumlah, transaksi.keterangan, "EXP"])
                        .then(result => { console.log('success insert trx') }).catch(err => {console.log('failed insert trx'); console.log(err) });
                } else {
                    // masuk pending transaction
                    let pendingTransaction = new PendingTransModel(product.tgl_beli,
                        descTrx,product.hrg_beli,"PENDING"
                    );
                    client.query('insert into pending_transaksi ("tanggal","jumlah", "keterangan", "kode_transaksi", "status_transaksi") values ($1,$2,$3,$4,$5)',
                        [pendingTransaction.tgl, pendingTransaction.jmlh, pendingTransaction.keterangan,"EXP", pendingTransaction.status_transaksi])
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
    let biaya = new BiayaModel(paramBody.nama, paramBody.harga, date, paramBody.grup_biaya);

    let descCost = "BIAYA TAMBAHAN : ".concat(biaya.nama).concat(":::Grup Biaya : ").concat(biaya.grup_biaya);
    pool.connect().then(client => {
        client.query('insert into biaya ("nama", "harga", "tgl_trans","grup_biaya") values ($1,$2,$3,$4)',
            [biaya.nama, biaya.harga, biaya.tgl_trans, biaya.grup_biaya])
            .then(result => {  
                if (paramBody.settle) {
                    //masuk transaction
                    let transaksi = new TransModel(biaya.tgl_trans, descCost, biaya.harga);
                    client.query('insert into transaksi ("tanggal","jumlah", "keterangan","kode_transaksi") values ($1,$2,$3,$4)',
                        [transaksi.tanggal, transaksi.jumlah, transaksi.keterangan,"EXP"])
                        .then(result => { console.log('success insert trx') }).catch(err => {console.log('failed insert trx'); console.log(err) });
                } else {
                    // masuk pending transaction
                    let pendingTransaction = new PendingTransModel(biaya.tgl_trans, descCost,biaya.harga,"PENDING");
                    client.query('insert into pending_transaksi ("tanggal","jumlah", "keterangan", "kode_transaksi","status_transaksi") values ($1,$2,$3,$4,$5)',
                        [pendingTransaction.tgl, pendingTransaction.jmlh, pendingTransaction.keterangan,"EXP", pendingTransaction.status_transaksi])
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

router.post('/api/v1/jualproduct', (httprequest, httpresponse) => {
    let paramBody = httprequest.body;
    var date = new Date();

    let product = new ProductModel(paramBody.plat, paramBody.merk, paramBody.tipe, paramBody.tahun, paramBody.pajak, paramBody.hrg_beli, paramBody.tgl_beli, paramBody.image,true,paramBody.harga_jual,date,paramBody.pembeli);

    pool.connect().then(client => {
        client.query('update product set status_jual = $1,hrg_jual=$2, tgl_jual=$3, pembeli=$4 where plat = $5',
            [product.status_jual, product.harga_jual, product.tgl_jual, product.pembeli, product.plat])
            .then(result => {
                let descTrx = "PENJUALAN MOTOR PLAT NO : ".concat(product.plat).concat(":::Tipe : ").concat(product.tipe).concat(" ").concat(product.merk);
                if (paramBody.settle) {
                    //masuk transaction
                    let transaksi = new TransModel(product.tgl_jual, descTrx, product.harga_jual);
                    client.query('insert into transaksi ("tanggal","jumlah", "keterangan", "kode_transaksi") values ($1,$2,$3,$4)',
                        [transaksi.tanggal, transaksi.jumlah, transaksi.keterangan, "INC"])
                        .then(result => { console.log('success insert trx') }).catch(err => {console.log('failed insert trx'); console.log(err) });
                } else {
                    // masuk pending transaction
                    let pendingTransaction = new PendingTransModel(product.tgl_jual,
                        descTrx,product.harga_jual,"PENDING"
                    );
                    client.query('insert into pending_transaksi ("tanggal","jumlah", "keterangan", "kode_transaksi", "status_transaksi") values ($1,$2,$3,$4,$5)',
                        [pendingTransaction.tgl, pendingTransaction.jmlh, pendingTransaction.keterangan,"INC", pendingTransaction.status_transaksi])
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

module.exports = router;
