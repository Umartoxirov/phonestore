// ---------- Demo product data (prices are demo prices in UZS) ----------
const PRODUCTS = [
  { id: 1, brand: "iPhone", name: "iPhone 16", storage: "128 GB", price: 11990000, old: 12990000, rating: 4.8, reviews: 214, popular: 98, img: "images/iphone16.svg", specs: ["6.1-inch OLED display", "A18 chip", "Dual camera system"] },
  { id: 2, brand: "iPhone", name: "iPhone 17", storage: "256 GB", price: 14990000, old: 15990000, rating: 4.9, reviews: 167, popular: 100, img: "images/iphone17.svg", specs: ["6.3-inch OLED display", "Latest A-series chip", "Dual camera system"] },
  { id: 3, brand: "Samsung", name: "Galaxy S25", storage: "256 GB", price: 12490000, old: 13490000, rating: 4.7, reviews: 189, popular: 94, img: "images/galaxy-s25.svg", specs: ["6.2-inch AMOLED display", "Snapdragon flagship chip", "Triple camera system"] },
  { id: 4, brand: "Redmi", name: "Redmi Note 14 Pro", storage: "256 GB", price: 3990000, old: 4390000, rating: 4.6, reviews: 302, popular: 96, img: "images/redmi-note14.svg", specs: ["6.67-inch AMOLED display", "200 MP main camera", "Fast charging"] },
  { id: 5, brand: "Redmi", name: "Redmi Note 13", storage: "128 GB", price: 2490000, old: null, rating: 4.4, reviews: 258, popular: 88, img: "images/redmi-note13.svg", specs: ["6.67-inch AMOLED display", "108 MP main camera", "5000 mAh battery"] },
  { id: 6, brand: "Xiaomi", name: "Xiaomi 14T", storage: "256 GB", price: 6490000, old: 6990000, rating: 4.6, reviews: 97, popular: 82, img: "images/xiaomi-14t.svg", specs: ["6.67-inch AMOLED display", "Leica-tuned cameras", "Fast wired charging"] },
  { id: 7, brand: "Honor", name: "Honor 200", storage: "256 GB", price: 4990000, old: 5490000, rating: 4.5, reviews: 76, popular: 78, img: "images/honor-200.svg", specs: ["6.7-inch curved display", "Portrait-focused camera", "100 W charging"] },
  { id: 8, brand: "Honor", name: "Honor X9c", storage: "256 GB", price: 3790000, old: null, rating: 4.3, reviews: 64, popular: 70, img: "images/honor-x9c.svg", specs: ["6.78-inch curved display", "Durable build", "6600 mAh battery"] },
  { id: 9, brand: "Accessories", name: "Wireless Earbuds", storage: "Charging case", price: 590000, old: 690000, rating: 4.5, reviews: 143, popular: 85, img: "images/accessories.svg", specs: ["Bluetooth connection", "Charging case included", "Touch controls"] }
];

// ---------- Helpers ----------
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const money = n => n.toLocaleString("ru-RU").replace(/\s/g, " ") + " soʻm";
const stars = r => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));

const grid = $("#productGrid"), emptyMsg = $("#emptyMsg");
const brandSel = $("#brandSel"), priceSel = $("#priceSel"), sortSel = $("#sortSel"), searchInput = $("#searchInput");

// ---------- Products: render, filter, sort ----------
function renderProducts() {
  const q = searchInput.value.trim().toLowerCase();
  const [min, max] = priceSel.value ? priceSel.value.split("-").map(Number) : [0, Infinity];
  let list = PRODUCTS.filter(p =>
    (!brandSel.value || p.brand === brandSel.value) &&
    p.price >= min && p.price <= max &&
    (!q || (p.brand + " " + p.name + " " + p.storage).toLowerCase().includes(q))
  );
  if (sortSel.value === "low") list.sort((a, b) => a.price - b.price);
  else if (sortSel.value === "high") list.sort((a, b) => b.price - a.price);
  else list.sort((a, b) => b.popular - a.popular);

  grid.innerHTML = list.map(p => {
    const off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
    return `<article class="card">
      ${off ? `<span class="disc">-${off}%</span>` : ""}
      <div class="pic"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
      <div class="info">
        <span class="brand">${p.brand}</span>
        <h3>${p.name}</h3>
        <span class="meta">${p.storage}</span>
        <span class="rating" aria-label="Rated ${p.rating} out of 5">${stars(p.rating)} <small>${p.rating} (${p.reviews})</small></span>
        <div class="price"><strong>${money(p.price)}</strong>${p.old ? `<s>${money(p.old)}</s>` : ""}</div>
        <div class="card-btns">
          <button class="btn btn-primary" data-add="${p.id}">Add to Cart</button>
          <button class="btn btn-ghost" data-view="${p.id}">View Details</button>
        </div>
      </div></article>`;
  }).join("");
  emptyMsg.hidden = list.length > 0;
}

[brandSel, priceSel, sortSel].forEach(el => el.addEventListener("change", renderProducts));
searchInput.addEventListener("input", renderProducts);
$("#searchForm").addEventListener("submit", e => { e.preventDefault(); $("#products").scrollIntoView(); });
$("#resetBtn").addEventListener("click", () => {
  brandSel.value = priceSel.value = ""; sortSel.value = "popular"; searchInput.value = ""; renderProducts();
});

function goToBrand(brand) {
  brandSel.value = brand; renderProducts();
  $("#products").scrollIntoView({ behavior: "smooth" });
}
$$(".cat").forEach(b => b.addEventListener("click", () => goToBrand(b.dataset.brand)));
$$("[data-filter]").forEach(a => a.addEventListener("click", () => { brandSel.value = a.dataset.filter; renderProducts(); }));
$("#offersBtn").addEventListener("click", () => { brandSel.value = ""; sortSel.value = "popular"; renderProducts(); });

// ---------- Cart (saved in localStorage) ----------
let cart = [];
try { cart = JSON.parse(localStorage.getItem("phoneStoreCart")) || []; } catch (e) { cart = []; }
const saveCart = () => { try { localStorage.setItem("phoneStoreCart", JSON.stringify(cart)); } catch (e) {} };

function renderCart() {
  const box = $("#cartItems");
  if (!cart.length) {
    box.innerHTML = '<p class="cart-empty">Your cart is empty. Add a phone to get started.</p>';
  } else {
    box.innerHTML = cart.map(i => {
      const p = PRODUCTS.find(x => x.id === i.id);
      return `<div class="ci">
        <img src="${p.img}" alt="">
        <div><h4>${p.name}</h4><p>${p.storage} · ${money(p.price)}</p>
          <div class="qty"><button data-dec="${p.id}" aria-label="Decrease quantity">−</button><span aria-live="polite">${i.qty}</span><button data-inc="${p.id}" aria-label="Increase quantity">+</button></div></div>
        <button class="rm" data-rm="${p.id}">Remove</button></div>`;
    }).join("");
  }
  const sum = cart.reduce((s, i) => s + PRODUCTS.find(x => x.id === i.id).price * i.qty, 0);
  $("#subtotal").textContent = $("#total").textContent = money(sum);
  $("#cartCount").textContent = cart.reduce((s, i) => s + i.qty, 0);
  saveCart();
}
function addToCart(id) {
  const item = cart.find(i => i.id === id);
  item ? item.qty++ : cart.push({ id, qty: 1 });
  renderCart(); toast(PRODUCTS.find(p => p.id === id).name + " added to cart");
}
function changeQty(id, d) {
  const item = cart.find(i => i.id === id); if (!item) return;
  item.qty += d; if (item.qty < 1) cart = cart.filter(i => i.id !== id);
  renderCart();
}
function openCart(open) {
  $("#drawer").classList.toggle("open", open);
  $("#drawer").setAttribute("aria-hidden", !open);
  $("#overlay").hidden = !open;
}
$("#cartBtn").addEventListener("click", () => openCart(true));
$("#closeCart").addEventListener("click", () => openCart(false));
$("#overlay").addEventListener("click", () => openCart(false));

$("#cartItems").addEventListener("click", e => {
  const t = e.target;
  if (t.dataset.inc) changeQty(+t.dataset.inc, 1);
  if (t.dataset.dec) changeQty(+t.dataset.dec, -1);
  if (t.dataset.rm) { cart = cart.filter(i => i.id !== +t.dataset.rm); renderCart(); }
});
grid.addEventListener("click", e => {
  const t = e.target.closest("button"); if (!t) return;
  if (t.dataset.add) addToCart(+t.dataset.add);
  if (t.dataset.view) showDetails(+t.dataset.view);
});

// ---------- Modal: product details and demo checkout ----------
const modal = $("#modal"), modalBody = $("#modalBody");
const openModal = html => { modalBody.innerHTML = html; modal.hidden = false; $("#modalClose").focus(); };
const closeModal = () => { modal.hidden = true; };
$("#modalClose").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });

function showDetails(id) {
  const p = PRODUCTS.find(x => x.id === id);
  openModal(`<div class="detail"><img src="${p.img}" alt="${p.name}">
    <div><span class="brand">${p.brand}</span><h2 id="modalTitle">${p.name}</h2><p class="meta">${p.storage}</p>
    <ul>${p.specs.map(s => `<li>${s}</li>`).join("")}</ul>
    <p class="price"><strong>${money(p.price)}</strong> <small>(demo price)</small></p>
    <button class="btn btn-primary full" id="detailAdd" data-id="${p.id}">Add to Cart</button></div></div>`);
  $("#detailAdd").addEventListener("click", () => { addToCart(p.id); closeModal(); });
}

$("#checkoutBtn").addEventListener("click", () => {
  if (!cart.length) return toast("Your cart is empty");
  openCart(false);
  openModal(`<div class="ok"><h2 id="modalTitle">Order placed (demo)</h2>
    <p>Thank you! This is a demo checkout, so no payment was taken and no order was created.</p>
    <button class="btn btn-primary" id="doneBtn">Done</button></div>`);
  cart = []; renderCart();
  $("#doneBtn").addEventListener("click", closeModal);
});

// ---------- Mobile menu ----------
const menuBtn = $("#menuBtn"), nav = $("#nav");
function toggleMenu(open) {
  nav.classList.toggle("open", open); menuBtn.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", open);
}
menuBtn.addEventListener("click", () => toggleMenu(!nav.classList.contains("open")));
$$("#nav a").forEach(a => a.addEventListener("click", () => toggleMenu(false)));

// ---------- Newsletter (frontend demo) ----------
$("#newsForm").addEventListener("submit", e => {
  e.preventDefault();
  const email = $("#email").value.trim(), msg = $("#newsMsg");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  msg.className = "form-msg " + (valid ? "good" : "err");
  msg.textContent = valid ? "Thanks for subscribing! (Demo only: no email was saved.)" : "Enter a valid email address, like name@example.com.";
  if (valid) e.target.reset();
});

// ---------- Account + toast + keyboard ----------
$("#accountBtn").addEventListener("click", () => toast("Account sign-in is not part of this demo"));
let toastTimer;
function toast(text) {
  const t = $("#toast"); t.textContent = text; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeModal(); openCart(false); toggleMenu(false); } });

renderProducts();
renderCart();
