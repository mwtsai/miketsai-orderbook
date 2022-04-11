var express = require('express');
var router = express.Router();

const bittrex = require('../controllers/bittrex');

/* GET home page. */
router.get('/', bittrex.getCurrencies);

module.exports = router;
