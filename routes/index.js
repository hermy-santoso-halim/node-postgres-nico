var express = require('express');
var cors = require('cors');
var router = express.Router();

router.use(cors({
  origin: '*'
}));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
  next();
});

module.exports = router;