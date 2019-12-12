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

router.post('/api/v1/invoices', (httprequest, httpresponse) => {
  const results = [];
  let paramBody = httprequest.body;
  let offset = (parseInt(paramBody.page) - 1) * parseInt(paramBody.pageLimit);
  let pageLimit = paramBody.pageLimit;
  let totalData =0;
  let invoiceNo =paramBody.invoiceNo;
  console.log(paramBody);

  pool.connect().then(client => {
      client.query('SELECT count(invoice_no) FROM invoice_header where invoice_no::varchar(255) like $1',[invoiceNo])
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
      client.query('SELECT * FROM invoice_header where invoice_no::varchar(255) like $1 ORDER BY tgl ASC LIMIT $2 OFFSET $3',[invoiceNo,pageLimit, offset])
          .then(result => {
              if (result.rowCount > 0) {
                  result.rows.forEach(ele => {
                      let invoice= new invoiceModel(ele.creator, ele.tgl, ele.list_pending, ele.notes_payment, ele.no_rek, ele.bank_rek, ele.nama_rek,ele.invoice_no);
                      results.push(invoice);
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

router.post('/api/v1/getinvoices', (httprequest, httpresponse) => {
  let paramBody = httprequest.body;
  let listPendingTrxs=[];
  let invoice;

  pool.connect().then(client => {
      client.query('SELECT * FROM invoice_header where invoice_no = $1', [paramBody.invoiceNo])
          .then(result => {
              if (result.rowCount > 0) {  
                  let ele = result.rows[0];
                  invoice= new invoiceModel(ele.creator, ele.tgl, ele.list_pending, ele.notes_payment, ele.no_rek, ele.bank_rek, ele.nama_rek,ele.invoice_no);
                  invoice.listPendingTrxs =[];
                  client.query('SELECT * FROM pending_transaksi where id_pendingtrans = ANY($1)', [product.list_pending])
                  .then(resultBiaya => {
                      if (resultBiaya.rowCount > 0) {
                          resultBiaya.rows.forEach(ele => {
                            let pendingTransaction = new PendingTransModel(element.tanggal,
                              element.keterangan,element.jumlah, element.id_pendingtrans
                          );
                              listPendingTrxs.push(pendingTransaction);
                          });
                          invoice.listPendingTrxs = listPendingTrxs;
                      }
                      httpresponse.status(200);
                      httpresponse.json(invoice);
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


module.exports = router;