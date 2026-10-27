const test = require("node:test");
const assert = require("node:assert/strict");
const { retryCheckout } = require("../shop/checkout");

// A fake payment provider that remembers which keys it has charged, like a real idempotency key.
function provider() {
  const charged = new Set();
  let attempts = 0;
  return {
    charges: () => charged.size,
    newAttemptKey: () => `attempt-${++attempts}`,
    charge(total, key) { charged.add(key); return { total, key }; },
  };
}

test("a retried checkout charges the customer once", () => {
  const payments = provider();
  const order = { total: 2400, paymentKey: "order-4821" };
  retryCheckout(order, payments); // the first request times out
  retryCheckout(order, payments); // the client retries
  assert.equal(payments.charges(), 1, "expected 1 charge, got 2");
});
