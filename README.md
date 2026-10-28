# estelle-demo-homepage

Northfold, the sample storefront behind the demo on [fatelabs.ca](https://www.fatelabs.ca). The sessions,
pull request and production error on the home page are about this repository.

```sh
npm start   # the store at http://localhost:3000
npm test
```

No dependencies: a Node server (`server.js`) serves the pages in `site/` and a small JSON API.

| Path | What it is |
|---|---|
| `site/` | The storefront: one page, four views (shop, product, cart, order), routed by the URL hash |
| `server.js` | `GET /api/products`, `POST /api/checkout`, and the static files |
| `shop/catalog.js` | The six products, priced in cents |
| `shop/checkout.js` | Takes payment for an order |
| `shop/inventory.js` | Checks and reserves stock |
| `shop/payments.js` | A test-mode stand-in for a card processor; a repeated payment key is the same charge |
| `src/activity.js` | Groups repeated attempts for the activity feed |

## The bug the demo fixes

`shop/checkout.js` mints a new payment key on every attempt, so when a checkout request times out and is
retried, the customer is charged twice. The server retries the first attempt on purpose, so you can see it:
pay for anything and the receipt says **2** charges. The fix is one line, reuse `order.paymentKey`, on the
`fix/checkout-retry` branch and its pull request. With it, the receipt says **1**.

This is a demo repository. It is not a production service, and nothing here processes real payments.
