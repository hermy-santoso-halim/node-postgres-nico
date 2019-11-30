var express = require('express');
var cors = require('cors');
var router = express.Router();
const { Pool } = require('pg')

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
        client.query('SELECT * FROM pending_transaksi ORDER BY tgl ASC LIMIT '.concat(paramBody.pageLimit).concat(' OFFSET ').concat(offset))
            .then(result => {
                if (result.rowCount > 0) {
                    result.rows.forEach(element => {
                        results.push(element);
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

router.post('/api/v1/pendingtrx', (httprequest, httpresponse) => {
    let paramBody = httprequest.body;
    var date = new Date();

    pool.connect().then(client => {
      client.query('insert into pending_transaksi ("id_pendingtrans","tgl", "keterangan", "jmlh") values ($1,$2,$3,$4)',
      [paramBody.id_pendingtrans, date, paramBody.keterangan, paramBody.jmlh])
      .then(result => {
        httpresponse.status(200);
        httpresponse.json({success:true});
      })
      .catch(err => {
        console.log(err.stack)
        httpresponse.status(500);
        httpresponse.json({success:false});
      });
    });
    
  });
  

module.exports = router;