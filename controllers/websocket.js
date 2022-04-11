const signalR = require('signalr-client');
const zlib = require('zlib');

const url = 'wss://socket-v3.bittrex.com/signalr';
const hub = ['c3'];

const apikey = '';

var client;
var resolveInvocationPromise = () => { };

// Connect to Websocket and Subscribe the orderbook
async function webSocket(marketSymbol, callback) {
  client = await connect(callback);
  await subscribe(client, marketSymbol);
  return client;
}

async function connect(callback) {
  return new Promise((resolve) => {
    const client = new signalR.client(url, hub);
    client.serviceHandlers.messageReceived = (message) => {
      messageReceived(message, callback);
    }
    client.serviceHandlers.disconnected = () => {
      console.log('Disconnected');
    }
    client.serviceHandlers.connected = () => {
      console.log('Connected');
      return resolve(client)
    }
  });
}

async function subscribe(client, marketSymbol) {
  const channels = [
    `orderbook_${marketSymbol}_25`
  ];
  const response = await invoke(client, 'subscribe', channels);

  for (var i = 0; i < channels.length; i++) {
    if (response[i]['Success']) {
      console.log('Subscription to "' + channels[i] + '" successful');
    }
    else {
      console.log('Subscription to "' + channels[i] + '" failed: ' + response[i]['ErrorCode']);
    }
  }
}

async function invoke(client, method, ...args) {
  return new Promise((resolve, reject) => {
    resolveInvocationPromise = resolve; // Promise will be resolved when response message received

    client.call(hub[0], method, ...args)
      .done(function (err) {
        if (err) { return reject(err); }
      });
  });
}


function messageReceived(message, callback) {
  const data = JSON.parse(message.utf8Data);
  if (data['R']) {
    resolveInvocationPromise(data.R);
  }
  else if (data['M']) {
    data.M.forEach(function (m) {
      if (m['A']) {
        if (m.A[0]) {
          const b64 = m.A[0];
          const raw = new Buffer.from(b64, 'base64');

          zlib.inflateRaw(raw, function (err, inflated) {
            if (!err) {
              const json = JSON.parse(inflated.toString('utf8'));
              callback(json);
            }
          });
        }
      }
    });
  }
}

exports.webSocket = webSocket;

