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

router.get('/api/v1/transaksi/:page/:pageLimit', (httprequest, httpresponse) => {
    const results = [];
    let paramBody = httprequest.params;
    let offset = (parseInt(paramBody.page) - 1) * parseInt(paramBody.pageLimit);
    let pageLimit = paramBody.pageLimit;
    let totalData =0;
    

    pool.connect().then(client => {
        client.query('SELECT count(id_transaksi) FROM transaksi')
            .then(result => {
                if (result.rowCount < 0) {
                    httpresponse.status(500);
                    httpresponse.json({});
                    console.log('Data tidak ditemukan')
                }
                    else (result.rowCount > 0) 
                        console.log(result.rows[0].count)
                        totalData = result.rows[0].count;
            })
            .catch(err=>{
                console.log(err.stack);
                httpresponse.status(500);
                httpresponse.json({});
            });
            client.query('SELECT * FROM transaksi LIMIT $1 OFFSET $2',[pageLimit, offset])
                .then(result => {
                    result.rows.forEach(ele => {
                        let transaksi = new TransModel(ele.tanggal, ele.keterangan, ele.jumlah,ele.kode_transaksi,ele.id_transaksi);
                        results.push(transaksi);
                        
                    });
                    let returnData ={totalCount:totalData,listData:results};
                    httpresponse.setHeader('Content-Type', 'application/json');
                    httpresponse.json(returnData);
                    client.release();
                })
                
            })
            .catch(err=>{
                console.log(err.stack);
                httpresponse.status(500);
                httpresponse.json({});
            });
        });
module.exports = router; 