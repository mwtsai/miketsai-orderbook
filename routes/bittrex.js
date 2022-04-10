var express = require('express');
var router = express.Router();

const bittrex = require('../controllers/bittrex');

/* GET bittrex listing. */
router.get('/currencies/', bittrex.getCurrencies);
router.get('/markets/', bittrex.getMarkets);
router.get('/markets/:marketSymbol/orderbook', bittrex.getOrderbook);

module.exports = router;
