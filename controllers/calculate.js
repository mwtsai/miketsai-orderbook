// Calculate total amount and aggregate.
function calculate(arr) {
    let aggQuantity = 0;
    let aggTotal = 0;
    arr.forEach(el => {
        const rate = Number(el.rate);
        const quantity = Number(el.quantity);
        const total = rate * quantity;
        aggQuantity += quantity;
        aggTotal += total;

        el.rate = rate.toFixed(8);
        el.quantity = quantity.toFixed(3);
        el.aggQuantity = aggQuantity.toFixed(3);
        el.total = total.toFixed(4)
        el.aggTotal = aggTotal.toFixed(4);
    });
}

exports.calculate = calculate;
