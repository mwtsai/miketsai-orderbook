// Filter by limit.
function filter(orderbook, filterItem) {

    // bid
    let bid = orderbook.bid;
    const bidAggSizeLimit = filterItem.bidAggSizeLimit;
    const bidAggTotalLimit = filterItem.bidAggTotalLimit;
    bid = filterLimit(bid, "aggQuantity", bidAggSizeLimit);
    bid = filterLimit(bid, "aggTotal", bidAggTotalLimit);
    orderbook.bid = bid;

    // ask
    let ask = orderbook.ask;
    const askAggSizeLimit = filterItem.askAggSizeLimit;
    const askAggTotalLimit = filterItem.askAggTotalLimit;
    ask = filterLimit(ask, "aggQuantity", askAggSizeLimit);
    ask = filterLimit(ask, "aggTotal", askAggTotalLimit);
    orderbook.ask = ask;
}

function filterLimit(arr, field, filterItem) {
    if (filterItem) {
        return arr.filter(el => {
            return Number(el[field]) < filterItem
        });
    } else {
        return arr;
    }
}

exports.filter = filter