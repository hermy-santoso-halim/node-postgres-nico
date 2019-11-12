var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/echo', (httprequest, httpresponse) => {
  httpresponse.status(200);
  httpresponse.json({ success: true });
})

router.get('/login', (httprequest, httpresponse) => {
  httpresponse.status(200);
  httpresponse.json({ message: "ini login"});
})

module.exports = router;
