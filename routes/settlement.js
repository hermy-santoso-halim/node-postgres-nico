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
})

router.use(cors({
  origin: '*'
}));

router.post('/api/v1/settlement', (httprequest, httpresponse) => {
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