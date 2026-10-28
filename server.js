// Northfold's server: the storefront pages in site/ and a small JSON API. No dependencies.
const http = require("node:http");
const path = require("node:path");
const { readFile } = require("node:fs/promises");
const { PRODUCTS, CATEGORIES, productBySlug } = require("./shop/catalog");
const { retryCheckout } = require("./shop/checkout");
const { reserveStock } = require("./shop/inventory");
const { createPayments } = require("./shop/payments");

const SITE = path.join(__dirname, "site");
const MAX_BODY_BYTES = 8 * 1024;
const MAX_LINES = 20;
const MAX_QUANTITY = 10;
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml" };

function createStore() {
  let lastOrder = 1040;
  return {
    stock: new Map(PRODUCTS.map((product) => [product.slug, { available: product.stock }])),
    payments: createPayments(),
    nextOrder: () => `NF-${++lastOrder}`,
  };
}

function parseCart(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_LINES) return null;
  const lines = items.map((item) => ({ product: productBySlug(item && item.slug), quantity: item && item.quantity }));
  const valid = lines.every((line) => line.product && Number.isInteger(line.quantity) && line.quantity >= 1 && line.quantity <= MAX_QUANTITY);
  const unique = new Set(lines.map((line) => line.product && line.product.slug)).size === lines.length;
  return valid && unique ? lines : null;
}

// Price the cart, reserve its stock, and take payment. The first attempt is treated as timed out and retried,
// the way a flaky phone connection retries it, so the response says how many charges that produced.
function checkout(store, items) {
  const lines = parseCart(items);
  if (!lines) return { status: 400, body: { error: "The cart is empty, too long, or has an unknown item." } };
  const short = lines.find((line) => store.stock.get(line.product.slug).available < line.quantity);
  if (short) return { status: 409, body: { error: `Only ${store.stock.get(short.product.slug).available} ${short.product.name} left.` } };
  for (const line of lines) reserveStock(store.stock.get(line.product.slug), line.quantity);
  const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const order = { id: store.nextOrder(), total, paymentKey: store.payments.newAttemptKey() };
  const before = store.payments.count();
  retryCheckout(order, store.payments); // the attempt whose response never arrived
  const charge = retryCheckout(order, store.payments);
  return { status: 200, body: { order: order.id, total, charge: charge.id, charges: store.payments.count() - before } };
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "content-type": type });
  res.end(type.startsWith("application/json") ? JSON.stringify(body) : body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) { reject(new Error("The request is too large.")); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); } catch { reject(new Error("The request is not JSON.")); }
    });
    req.on("error", reject);
  });
}

async function serveFile(res, pathname) {
  const file = path.normalize(path.join(SITE, pathname === "/" ? "index.html" : pathname));
  if (!file.startsWith(SITE + path.sep)) return send(res, 404, { error: "Not found." });
  try {
    send(res, 200, await readFile(file), TYPES[path.extname(file)] || "application/octet-stream");
  } catch {
    send(res, 404, { error: "Not found." });
  }
}

function createServer(store = createStore()) {
  return http.createServer(async (req, res) => {
    const { pathname } = new URL(req.url, "http://localhost");
    if (req.method === "GET" && pathname === "/api/products") return send(res, 200, { products: PRODUCTS, categories: CATEGORIES });
    if (req.method === "POST" && pathname === "/api/checkout") {
      let body;
      try { body = await readJson(req); } catch (error) { return send(res, 400, { error: error.message }); }
      const result = checkout(store, body.items);
      return send(res, result.status, result.body);
    }
    if (req.method !== "GET") return send(res, 405, { error: "Method not allowed." });
    return serveFile(res, pathname);
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, () => console.log(`Northfold is running at http://localhost:${port}`));
}

module.exports = { createServer, createStore, checkout };
