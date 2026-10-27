// Check and update the available stock in one operation.
function reserveStock(stock, quantity) {
  if (quantity <= 0 || stock.available < quantity) return false;
  stock.available -= quantity;
  return true;
}

module.exports = { reserveStock };
