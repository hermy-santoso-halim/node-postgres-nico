var express = require('express');
var cors = require('cors');
var router = express.Router();
var invoiceModel = require('../models/invoice_header');

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

router.post('/api/v1/invoice', (httprequest, httpresponse) => {
  let paramBody = httprequest.body;
  var date = new Date();

  console.log(paramBody);

  let invoice = new invoiceModel(paramBody.created_by, date,paramBody.pendTrxIds,
    paramBody.desc, paramBody.noRek, paramBody.bankRek, paramBody.namaRek);


  pool.connect().then(client => {
    client.query('insert into invoice_header ("creator","tgl", "list_pending", "notes_payment","no_rek","bank_rek","nama_rek") values ($1,$2,$3,$4,$5,$6,$7) returning invoice_no',
    [invoice.creator,invoice.tgl,invoice.list_pending, invoice.notes_payment,invoice.no_rek, invoice.bank_rek,invoice.nama_rek])
    .then(result => {
      let returnId =result.rows[0].invoice_no;
      client.query('update pending_transaksi set status_transaksi =\'PROCESSED\' where id_pendingtrans = ANY ($1)',[invoice.list_pending])
      .then(resultUpdate =>{
        httpresponse.status(200);
        httpresponse.json({success:true, returnId:returnId});
      })
      .catch(errorUpdate => {
        console.log(errorUpdate.stack)
        httpresponse.status(500);
        httpresponse.json({success:false});
      })
    })
    .catch(err => {
      console.log(err.stack)
      httpresponse.status(500);
      httpresponse.json({success:false});
    });
  });
  
});


module.exports = router;