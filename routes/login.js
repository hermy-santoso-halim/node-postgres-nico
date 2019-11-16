var express = require('express');
var cors = require('cors');
var router = express.Router();
const { Pool } = require('pg');
var session = require('express-session');

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
router.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

router.get('/echo', (httprequest, httpresponse) => {
    httpresponse.status(200);
    httpresponse.json({ success: true });
})

router.post('/api/v1/akun/login', (httprequest, httpresponse) => {
    var userid = httprequest.body.userid;
    var password = httprequest.body.password;
    if (userid && password){
        pool.connect().then(client => {
            client.query('select * from akun where userid=$1 and password = $2',[userid, password] )
                .then(result => {
                if (result.rows.length > 0) {
                    httpresponse.json(result.rows[0]);
                } else {
                    httpresponse.json({message: "Incorrect Username/Password"});
                }
            });
        });
    } else {
        httpresponse.json({message: "Please enter Username and Password!"});
    }
});

module.exports= router;