// Northfold's storefront: four views (shop, product, cart, order) over the server's JSON API, routed by the
// URL hash so the whole store is one static page.
const root = document.getElementById("app");
const CART_KEY = "northfold-cart";
const FREE_SHIPPING_CENTS = 7500;
const SHIPPING_CENTS = 600;
const MAX_QUANTITY = 10;
const state = { products: [], categories: [], cart: readCart(), paying: false, error: "", orders: {} };

function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { return {}; }
}
function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(state.cart)); } catch { /* a private window keeps the cart for this visit */ }
}

const money = (cents) => `$${(cents / 100).toFixed(2)}`;
const esc = (text) => String(text).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const itemCount = () => Object.values(state.cart).reduce((sum, n) => sum + n, 0);
const cartLines = () => Object.entries(state.cart)
  .map(([slug, quantity]) => ({ product: state.products.find((p) => p.slug === slug), quantity }))
  .filter((line) => line.product);
const subtotal = () => cartLines().reduce((sum, line) => sum + line.product.price * line.quantity, 0);
const shipping = (cents) => (cents === 0 || cents >= FREE_SHIPPING_CENTS ? 0 : SHIPPING_CENTS);
const art = (p) => `<span class="sf-art" style="--tint:${p.tint}"><img src="/art/${p.slug}.svg" alt="${esc(p.name)}"></span>`;

const MARK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 20 12 4l9 16"/><path d="M7.5 12h9"/></svg>`;

function chrome(active, body) {
  const nav = [["All", "#/"], ...state.categories.map((c) => [c, `#/c/${c.toLowerCase()}`])]
    .map(([label, href]) => `<a href="${href}"${label === active ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  return `<p class="sf-announce">Free shipping on orders over ${money(FREE_SHIPPING_CENTS)}</p>
    <header class="sf-header"><a class="sf-logo" href="#/">${MARK}Northfold</a><nav class="sf-nav">${nav}</nav>
      <a class="sf-cart-link" href="#/cart">Cart <b>${itemCount()}</b></a></header>
    <main class="sf-main"><div class="sf-view">${body}</div></main>
    <footer class="sf-footer"><span>Northfold Supply Co.</span><span>A demo store. Nothing here is for sale.</span></footer>`;
}

function shopView(category) {
  const products = category ? state.products.filter((p) => p.category.toLowerCase() === category) : state.products;
  const title = category ? products[0]?.category ?? "Nothing here" : "Goods that last.";
  const cards = products.map((p) => `<a class="sf-card" href="#/p/${p.slug}">${art(p)}
    <span class="sf-card-meta"><span>${esc(p.name)}<small>${esc(p.detail)}</small></span><span>${money(p.price)}</span></span></a>`).join("");
  return chrome(category ? title : "All", `<section class="sf-hero"><h1>${esc(title)}</h1>
    <p>Bags, notebooks and kitchen things made to be used every day, and to be used for years.</p></section>
    <div class="sf-grid">${cards}</div>`);
}

function productView(slug) {
  const p = state.products.find((item) => item.slug === slug);
  if (!p) return chrome("", `<p class="sf-empty">That product isn’t in the shop. <a href="#/">Back to the shop</a></p>`);
  const inCart = state.cart[p.slug] || 0;
  return chrome(p.category, `<a class="sf-back" href="#/c/${p.category.toLowerCase()}">← ${esc(p.category)}</a>
    <div class="sf-product">${art(p)}<div>
      <p class="sf-eyebrow">${esc(p.category)}</p><h1>${esc(p.name)}</h1><p class="sf-price">${money(p.price)} · ${esc(p.detail)}</p>
      <p class="sf-blurb">${esc(p.blurb)}</p>
      <div class="sf-buy"><button class="sf-primary" data-action="add" data-slug="${p.slug}">Add to cart</button>
        ${inCart ? `<a class="sf-back" href="#/cart">${inCart} in your cart</a>` : ""}</div>
      <ul class="sf-facts"><li>Ships in two working days</li><li>Free returns for 30 days</li><li>${p.stock} in stock</li></ul>
    </div></div>`);
}

function cartView() {
  const lines = cartLines();
  if (lines.length === 0) return chrome("", `<div class="sf-done"><h1>Your cart is empty.</h1><p><a class="sf-primary" href="#/">Find something</a></p></div>`);
  const rows = lines.map(({ product: p, quantity }) => `<div class="sf-line">${art(p)}
    <span><b>${esc(p.name)}</b><small>${esc(p.detail)} · ${money(p.price)}</small></span>
    <span class="sf-line-end"><span class="sf-qty"><button data-action="less" data-slug="${p.slug}" aria-label="One fewer">−</button><output>${quantity}</output>
      <button data-action="more" data-slug="${p.slug}" aria-label="One more">+</button></span>
      <button class="sf-remove" data-action="remove" data-slug="${p.slug}">Remove</button></span></div>`).join("");
  const sub = subtotal();
  return chrome("", `<div class="sf-cart"><div><h1>Your cart</h1>${rows}</div>
    <aside class="sf-summary"><dl><dt>Subtotal</dt><dd>${money(sub)}</dd><dt>Shipping</dt><dd>${shipping(sub) ? money(shipping(sub)) : "Free"}</dd>
      <dt class="sf-total">Total</dt><dd class="sf-total">${money(sub + shipping(sub))}</dd></dl>
      <button class="sf-primary" data-action="pay"${state.paying ? " disabled" : ""}>${state.paying ? "Paying…" : `Pay ${money(sub + shipping(sub))}`}</button>
      <p class="sf-note">Test mode. No card is charged.</p>${state.error ? `<p class="sf-error">${esc(state.error)}</p>` : ""}</aside></div>`);
}

function orderView(id) {
  const order = state.orders[id];
  if (!order) return chrome("", `<p class="sf-empty">We can’t find that order. <a href="#/">Back to the shop</a></p>`);
  const once = order.charges === 1;
  return chrome("", `<div class="sf-done"><span class="sf-done-mark">✓</span><h1>Thank you. Your order is in.</h1>
    <p>We’ll email you when ${esc(order.order)} ships.</p>
    <div class="sf-receipt"><p><span>Order</span><code>${esc(order.order)}</code></p><p><span>Total</span><b>${money(order.total)}</b></p>
      <p><span>Payment</span><code>${esc(order.charge)}</code></p>
      <p><span>Charges for this order</span><b${once ? "" : ' data-tone="bad"'}>${order.charges}${once ? "" : " (the retry charged again)"}</b></p></div>
    <a class="sf-primary" href="#/">Keep shopping</a></div>`);
}

function render() {
  const [, view, arg] = location.hash.replace(/^#/, "").split("/");
  if (view === "p") root.innerHTML = productView(arg);
  else if (view === "cart") root.innerHTML = cartView();
  else if (view === "order") root.innerHTML = orderView(arg);
  else root.innerHTML = shopView(view === "c" ? arg : "");
}

function setQuantity(slug, quantity) {
  const next = { ...state.cart };
  if (quantity <= 0) delete next[slug]; else next[slug] = Math.min(quantity, MAX_QUANTITY);
  state.cart = next;
  saveCart();
}

async function pay() {
  state.paying = true; state.error = ""; render();
  try {
    const items = cartLines().map(({ product, quantity }) => ({ slug: product.slug, quantity }));
    const response = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ items }) });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "The payment didn’t go through.");
    state.orders = { ...state.orders, [body.order]: body };
    state.cart = {}; saveCart();
    location.hash = `#/order/${body.order}`;
  } catch (error) {
    state.error = error.message;
  } finally {
    state.paying = false; render();
  }
}

root.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action, slug } = button.dataset;
  if (action === "add") setQuantity(slug, (state.cart[slug] || 0) + 1);
  if (action === "more") setQuantity(slug, (state.cart[slug] || 0) + 1);
  if (action === "less") setQuantity(slug, (state.cart[slug] || 0) - 1);
  if (action === "remove") setQuantity(slug, 0);
  if (action === "pay") { pay(); return; }
  render();
});
window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });

fetch("/api/products")
  .then((response) => response.json())
  .then((body) => { state.products = body.products; state.categories = body.categories; render(); })
  .catch(() => { root.innerHTML = `<p class="sf-empty">The shop couldn’t load. Is the server running? Try <code>npm start</code>.</p>`; });
