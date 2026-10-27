# estelle-demo-homepage

The sample storefront behind the demo on [fatelabs.ca](https://www.fatelabs.ca). Every session,
pull request and production error you see on the home page happens in this repository.

It is deliberately small: a checkout, an inventory check and an activity feed.

```sh
npm test
```

## The bug the demo fixes

`shop/checkout.js` mints a new payment key on every attempt, so when a checkout request times out
and is retried, the customer is charged twice. The fix is one line: reuse `order.paymentKey`.
See the `fix/checkout-retry` branch and its pull request.

This is a demo repository. It is not a production service, and nothing here processes real payments.
