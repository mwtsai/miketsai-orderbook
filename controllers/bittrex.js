const { calculate } = require('./calculate');
const { filter } = require('./filter');
const { restApi } = require('./restApi');
const { webSocket } = require('./websocket');

// List currencies.
exports.getCurrencies = function (req, res, next) {
  const path = '/currencies';

  // Send request to bittrex
  restApi(path, (data) => {
    const currencies = JSON.parse(data);

    res.render('currencies', {
      currencies: currencies
    });
  });
};

// List markets.
exports.getMarkets = function (req, res, next) {
  const currencySymbol = req.query.currencySymbol;
  const path = '/markets';

  // Send request to bittrex
  restApi(path, (data) => {
    let markets = JSON.parse(data);
    filterMarkets = markets.filter(el => el.symbol.includes(currencySymbol));

    res.render('markets', {
      currencySymbol: currencySymbol,
      markets: filterMarkets
    });
  });
};

// Retrieve the order book for a specific market.
exports.getOrderbook = function (req, res, next) {
  const marketSymbol = req.params.marketSymbol;
  const filterItem = req.query;
  const path = `/markets/${marketSymbol}/orderbook`;

  webSocket(marketSymbol, (result) => {
    console.log('Subscription to "' + result + '" successful');

    // Call REST API to bittrex
    restApi(path, (data, sequence) => {
      let orderbook = JSON.parse(data);

      console.log("restApi: " + sequence);

      // Calculate and Aggregate
      calculate(orderbook.bid);
      calculate(orderbook.ask);

      // Filter by limit
      filter(orderbook, filterItem);

      res.render('orderbook', {
        marketSymbol: marketSymbol,
        orderbook: orderbook,
        filterItem: filterItem
      });
    });

  }, (result) => {
    const currSequence = result.sequence;

    console.log("webSocket: " + currSequence);
  });

};


