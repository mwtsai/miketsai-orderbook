const { calculate } = require('./calculate');
const { filter } = require('./filter');
const { restApi } = require('./restApi');
const { webSocket } = require('./websocket');
const { io } = require("socket.io-client");

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

  // Sequence for sync
  let restApiSeq;
  let firstWebSocketSeq;
  // Data
  let orderbook;

  const port = normalizePort(process.env.PORT || '3000');;
  const socket = io(`ws://localhost:${port}`);

  socket.on('connect', () => {
    const socketId = socket.id;
    // Connect to view
    socket.emit(socketId, 'start');

    // Call REST API to bittrex
    restApi(path, (data, sequence) => {
      orderbook = JSON.parse(data);
      if (orderbook.code) {
        return orderbook.code;

      } else {
        restApiSeq = sequence;

        assembleOrderbook(orderbook, filterItem, (output) => {
          res.render('orderbook', {
            marketSymbol: marketSymbol,
            orderbook: output,
            filterItem: filterItem,
            socketId: socketId
          });
        });

        // Connect to Websocket and Subscribe the orderbook
        const client = webSocket(marketSymbol, (result) => {
          const currSequence = result.sequence;

          // Get first sequence
          if (!firstWebSocketSeq) {
            firstWebSocketSeq = currSequence;
          }

          // Call rest api to get new sequence
          if (restApiSeq < firstWebSocketSeq) {
            restApi(path, (data, sequence) => {
              orderbook = JSON.parse(data);
              restApiSeq = sequence;

              assembleOrderbook(orderbook, filterItem, (output) => {
                socket.emit(`${socketId}_${marketSymbol}`, output);
              });
            });
          }

          // Only update new data
          if (currSequence > restApiSeq) {
            let bid = orderbook.bid;
            let ask = orderbook.ask;
            let bidDeltas = result.bidDeltas;
            let askDeltas = result.askDeltas;

            bid = updateOrder(bid, bidDeltas);
            ask = updateOrder(ask, askDeltas);

            orderbook.bid = bid;
            orderbook.ask = ask;

            assembleOrderbook(orderbook, filterItem, (output) => {
              socket.emit(`${socketId}_${marketSymbol}`, output);
            });
          }
        });

        // End Websocket
        socket.on(socketId, (msg) => {
          socket.on(msg, () => {
            client.then((value) => {
              value.end();
            });
          });
        });
      }
    });

  });
};

function updateOrder(arr, arrDeltas) {
  arrDeltas.forEach(el => {
    arr = arr.filter(e => {
      return e.rate != el.rate;
    });

    if (el.quantity != 0) {
      arr.push(el);
    }
  });
  return arr;
}

function assembleOrderbook(orderbook, filterItem, callback) {
  // Sort
  orderbook.bid.sort((a, b) => {
    if (Number(a.rate) > Number(b.rate)) {
      return -1;
    } else {
      return 1;
    }
  });
  orderbook.ask.sort((a, b) => {
    if (Number(a.rate) < Number(b.rate)) {
      return -1;
    } else {
      return 1;
    }
  });

  // Calculate and Aggregate
  calculate(orderbook.bid);
  calculate(orderbook.ask);

  // Filter by limit
  filter(orderbook, filterItem);

  callback(orderbook);
}

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}