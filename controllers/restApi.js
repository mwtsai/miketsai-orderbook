const https = require('https');

// Call REST API to bittrex.
function restApi(path, calllback) {
  const url = `https://api.bittrex.com/v3${path}`;
  https.get(url, (res) => {
    const sequence = res.headers.sequence;
    let data = '';
    res.on('data', (chunk) => {
      data = data + chunk.toString();
    });

    res.on('end', () => {
      calllback(data, sequence);
    });

  }).on('error', (e) => {
    console.error(e);
  });
}

exports.restApi = restApi;

