// One payment identity, even when the request is retried.
function retryCheckout(order, payments) {
  const key = order.paymentKey;
  return payments.charge(order.total, key);
}

module.exports = { retryCheckout };
