let cart = [];
let total = 0;
let allProducts = [];

function decreaseQty(name) {
  const item = cart.find(i => i.name === name);

  if (item.qty > 1) {
    item.qty--;
  } else {
    cart = cart.filter(i => i.name !== name);
  }

  total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  updateCartUI();
  saveCart();
}

function increaseQty(name) {
  const item = cart.find(i => i.name === name);
  item.qty++;

  total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  updateCartUI();
  saveCart();
}

function removeItem(name) {
  cart = cart.filter(i => i.name !== name);

  total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  updateCartUI();
  saveCart();
}

function formatRupiah(number) {
  return number.toLocaleString("id-ID");
}

function loadProductsSimple() {
  allProducts = [
    { id: 1, name: "Kaos Basic Hitam", price: 45000, category: "clothes", icon: "👕", discount: 20, sold: 342 },
    { id: 2, name: "Kaos Basic Putih", price: 45000, category: "clothes", icon: "👕", discount: 0, sold: 218 },
    { id: 3, name: "Kaos Oversized Hijau", price: 65000, category: "clothes", icon: "👕", discount: 15, sold: 156 },
    { id: 4, name: "Jaket Denim Biru", price: 180000, category: "clothes", icon: "🧥", discount: 25, sold: 89 },
    { id: 5, name: "Hoodie Cream", price: 130000, category: "clothes", icon: "🧥", discount: 10, sold: 267 },
    { id: 6, name: "Hoodie Black Premium", price: 150000, category: "clothes", icon: "🧥", discount: 20, sold: 195 },
    { id: 7, name: "Celana Jeans Slim", price: 120000, category: "clothes", icon: "👖", discount: 15, sold: 412 },
    { id: 8, name: "Celana Chino Khaki", price: 125000, category: "clothes", icon: "👖", discount: 0, sold: 203 },
    { id: 9, name: "Shirt Formal Biru", price: 95000, category: "clothes", icon: "👔", discount: 10, sold: 178 },
    { id: 10, name: "Coat Winter Abu", price: 250000, category: "clothes", icon: "🧥", discount: 30, sold: 45 },
    { id: 11, name: "Dress Casual Stripe", price: 110000, category: "clothes", icon: "👗", discount: 20, sold: 324 },
    { id: 12, name: "Dress Elegant Hitam", price: 160000, category: "clothes", icon: "👗", discount: 15, sold: 143 },
    { id: 13, name: "Crop Top White", price: 55000, category: "clothes", icon: "👕", discount: 10, sold: 289 },
    { id: 14, name: "Blouse Silk Cream", price: 140000, category: "clothes", icon: "👔", discount: 25, sold: 167 },
    { id: 15, name: "Skirt Mini Denim", price: 95000, category: "clothes", icon: "👖", discount: 0, sold: 401 },
    { id: 16, name: "Sneakers White Classic", price: 200000, category: "shoes", icon: "👟", discount: 15, sold: 523 },
    { id: 17, name: "Sneakers Black Premium", price: 250000, category: "shoes", icon: "👟", discount: 20, sold: 234 },
    { id: 18, name: "Running Shoes Green", price: 220000, category: "shoes", icon: "👟", discount: 25, sold: 189 },
    { id: 19, name: "Casual Loafer Brown", price: 180000, category: "shoes", icon: "👞", discount: 10, sold: 142 },
    { id: 20, name: "Canvas High Top", price: 150000, category: "shoes", icon: "👟", discount: 0, sold: 356 },
    { id: 21, name: "Heels Elegant Black", price: 210000, category: "shoes", icon: "👠", discount: 30, sold: 178 },
    { id: 22, name: "Sandal Casual Blue", price: 75000, category: "shoes", icon: "👡", discount: 15, sold: 467 },
    { id: 23, name: "Topi Snapback Hitam", price: 45000, category: "accessories", icon: "🧢", discount: 20, sold: 298 },
    { id: 24, name: "Tas Ransel Urban", price: 120000, category: "accessories", icon: "🎒", discount: 15, sold: 212 },
    { id: 25, name: "Tas Tangan Coklat", price: 180000, category: "accessories", icon: "👜", discount: 25, sold: 134 },
    { id: 26, name: "Watch Fashion Hitam", price: 150000, category: "accessories", icon: "⌚", discount: 10, sold: 267 },
    { id: 27, name: "Dompet Kulit Hitam", price: 85000, category: "accessories", icon: "👛", discount: 0, sold: 389 },
    { id: 28, name: "Kacamata Sunglasses", price: 95000, category: "accessories", icon: "😎", discount: 20, sold: 445 },
    { id: 29, name: "Scarf Wool Cream", price: 55000, category: "accessories", icon: "🧣", discount: 15, sold: 201 },
    { id: 30, name: "Belt Leather Premium", price: 65000, category: "accessories", icon: "👕", discount: 10, sold: 523 },
    { id: 31, name: "🔥 Kaos Bundle 3pcs", price: 99000, category: "sale", icon: "👕", discount: 50, sold: 892 },
    { id: 32, name: "🔥 Hoodie Overload", price: 110000, category: "sale", icon: "🧥", discount: 45, sold: 567 },
  ];

  renderProductsGrid(allProducts);
}

function renderProductsGrid(products) {
  const container = document.getElementById("product-list");
  container.innerHTML = "";

  products.forEach(product => {
    const discount = product.discount || 0;
    const originalPrice = Math.round(product.price / (1 - discount/100));

    const div = document.createElement("div");
    div.className = "product-card";
    div.innerHTML = `
      <div class="product-image">
        <div class="image-placeholder">${product.icon}</div>
        ${discount > 0 ? `<div class="discount-badge">-${discount}%</div>` : ''}
      </div>
      <div class="product-body">
        <h3 class="product-name">${product.name}</h3>
        <div class="product-rating">⭐ 4.8 • ${product.sold} terjual</div>
        <div class="product-price">
          ${discount > 0 ? `<span class="original-price">Rp ${originalPrice.toLocaleString('id-ID')}</span>` : ''}
          <span class="current-price">Rp ${product.price.toLocaleString('id-ID')}</span>
        </div>
        <button onclick="addToCart('${product.name}', ${product.price})">+ Keranjang</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }

  total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  updateCartUI();
  saveCart();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
  updateCartUI();
}

function updateCartUI() {
  const cartEl = document.getElementById("cart");
  const cartCount = document.getElementById("cartCount");

  cartEl.innerHTML = "";
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalItems;

  if (cart.length === 0) {
    cartEl.innerHTML = "<p>Keranjang kosong</p>";
  }
}

function checkout() {
  if (cart.length === 0) return alert("Keranjang kosong!");

  const customer = prompt("Masukkan nama Anda:");
  if (!customer) return;

  localStorage.setItem('customerName', customer);
  window.location.href = 'checkout.html';
}

// INIT
loadProductsSimple();
loadCart();