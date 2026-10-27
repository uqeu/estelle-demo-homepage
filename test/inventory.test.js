const test = require("node:test");
const assert = require("node:assert/strict");
const { reserveStock } = require("../shop/inventory");

test("reserves stock that is available", () => {
  const stock = { available: 3 };
  assert.equal(reserveStock(stock, 2), true);
  assert.equal(stock.available, 1);
});

test("refuses more than is available, and nonpositive quantities", () => {
  const stock = { available: 1 };
  assert.equal(reserveStock(stock, 2), false);
  assert.equal(reserveStock(stock, 0), false);
  assert.equal(stock.available, 1);
});
