# Orderbook

## Try it
You can access the website: 
[miketsai-orderbook](https://miketsai-orderbook.herokuapp.com/bittrex/markets/ETH-BTC/orderbook?bidAggSizeLimit=&bidAggTotalLimit=5&askAggSizeLimit=150&askAggTotalLimit=)

## Features
### Currencies
List [currencies](https://miketsai-orderbook.herokuapp.com/).  
- It's the index of this app. 
- Press "Get Markets" to get the markets which are relative to the currency symbol you choose.
### Markets
List [maktets](https://miketsai-orderbook.herokuapp.com/bittrex/markets?currencySymbol=1ECO).   
- Press the markets you wanna see.
### Orderbook
Retrieve the [order book](https://miketsai-orderbook.herokuapp.com/bittrex/markets/1ECO-BTC/orderbook) for a specific market.     
- You can see two lists of bid(buying) and ask(selling) orders. The orderbook are updated when trades occur.  
- You can also limit the "Agg. Size" and "Agg. Total" to filter the data smaller than you set.

## Make it better
Some thinking to make it better  
1. Integrate with frontend framework to make it look better. Make pug more slightly is also suggested.
2. Do more validation which is referenced from [Bittrex](https://bittrex.github.io/api/v3#topic-Synchronizing)
3. Alert the timeout message to user or reconnect the WebSocket when it disconnected. It is up to the scenario.
4. Allow user to record their favorite currencies/markets. 
