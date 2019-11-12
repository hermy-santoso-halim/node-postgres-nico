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

router.get('/api/v1/akun/:userid/:password', (httprequest, httpresponse) => {
    const results = [];
    let paramBody = httprequest.params;
    
    pool.connect().then(client => {
        client.query('select * from akun where userid=$1 and password = $2',[paramBody.userid, paramBody.password])
            .then(result => {
                if (result.rowCount > 0) {
                    result.rows.forEach(element => {
                        results.push(element);
                        console.log(element)
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


module.exports= router;