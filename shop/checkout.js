// One payment identity, even when the request is retried.
function retryCheckout(order, payments) {
  const key = payments.newAttemptKey();
  return payments.charge(order.total, key);
}

module.exports = { retryCheckout };
