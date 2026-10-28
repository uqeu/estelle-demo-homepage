// Northfold's catalog. Prices are in cents, so a total never rounds.
const PRODUCTS = [
  { slug: "everyday-tote", name: "Everyday Tote", category: "Bags", price: 2400, stock: 24, tint: "#ece4d4", detail: "Natural canvas",
    blurb: "Heavyweight cotton canvas with a flat base and an inside pocket for keys. Carries a week of groceries and folds flat into a drawer." },
  { slug: "weekender", name: "Canvas Weekender", category: "Bags", price: 6800, stock: 9, tint: "#dfe4dc", detail: "Moss green",
    blurb: "Room for three days, a shoulder strap that stays put, and a zip that runs the full length so nothing hides at the bottom." },
  { slug: "field-notebooks", name: "Field Notebooks", category: "Desk", price: 1400, stock: 40, tint: "#efe7dc", detail: "Set of three",
    blurb: "Three pocket notebooks with dot-grid pages and an elastic band. Thread-sewn, so they open flat and stay together." },
  { slug: "steel-bottle", name: "Steel Bottle", category: "Kitchen", price: 3200, stock: 18, tint: "#dde3e7", detail: "750 ml, insulated",
    blurb: "Double-walled steel keeps water cold for a day and coffee hot through the morning. The cap carries on one finger." },
  { slug: "wool-beanie", name: "Wool Beanie", category: "Wear", price: 2800, stock: 15, tint: "#ecdcd3", detail: "Rust",
    blurb: "Merino rib knit with a deep cuff. Warm without the itch, and soft enough to wear all day." },
  { slug: "linen-apron", name: "Linen Apron", category: "Kitchen", price: 3800, stock: 11, tint: "#e8e3d6", detail: "Oat",
    blurb: "Washed linen with long ties and a split pocket for a thermometer and a pen. Gets softer every wash." },
];

const CATEGORIES = ["Bags", "Wear", "Desk", "Kitchen"];

function productBySlug(slug) {
  return PRODUCTS.find((product) => product.slug === slug) || null;
}

module.exports = { PRODUCTS, CATEGORIES, productBySlug };
