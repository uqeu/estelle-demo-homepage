const test = require("node:test");
const assert = require("node:assert/strict");
const { createServer, createStore, checkout } = require("../server");
const { PRODUCTS } = require("../shop/catalog");

test("a checkout prices the cart and reserves its stock", () => {
  const store = createStore();
  const result = checkout(store, [{ slug: "everyday-tote", quantity: 2 }, { slug: "field-notebooks", quantity: 1 }]);
  assert.equal(result.status, 200);
  assert.equal(result.body.total, 2 * 2400 + 1400);
  assert.equal(store.stock.get("everyday-tote").available, PRODUCTS[0].stock - 2);
});

test("a bad cart is refused and leaves stock alone", () => {
  const store = createStore();
  for (const items of [[], [{ slug: "nope", quantity: 1 }], [{ slug: "weekender", quantity: 0 }], [{ slug: "weekender", quantity: 1 }, { slug: "weekender", quantity: 1 }]]) {
    assert.equal(checkout(store, items).status, 400, JSON.stringify(items));
  }
  assert.equal(checkout(store, [{ slug: "weekender", quantity: 10 }]).status, 409);
  assert.equal(store.stock.get("weekender").available, PRODUCTS.find((p) => p.slug === "weekender").stock);
});

test("the server serves the store and its API, and nothing outside site/", async (t) => {
  const server = createServer().listen(0);
  t.after(() => server.close());
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://localhost:${server.address().port}`;
  assert.match(await (await fetch(`${base}/`)).text(), /Northfold/);
  assert.equal((await (await fetch(`${base}/api/products`)).json()).products.length, PRODUCTS.length);
  assert.equal((await fetch(`${base}/%2e%2e/package.json`)).status, 404);
  const paid = await fetch(`${base}/api/checkout`, { method: "POST", body: JSON.stringify({ items: [{ slug: "wool-beanie", quantity: 1 }] }) });
  assert.equal((await paid.json()).total, 2800);
});
