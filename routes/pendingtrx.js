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
    httpresponse.status(300);
    httpresponse.json({ success: true });
})

module.exports = router;