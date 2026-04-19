let cart = [];
let total = 0;
let allProducts = [];

// ================= PRODUCT LOADING LOGIC =================

function loadProductsSimple() {
  // Ambil data dari database admin (localStorage)
  const produkAdmin = JSON.parse(localStorage.getItem("produk_clothing")) || [];
  
  // 1. FILTER: Hanya ambil produk yang TIDAK disembunyikan (hidden !== true)
  const filteredAdmin = produkAdmin.filter(p => !p.hidden);
  
  // 2. Map data admin ke format yang dikenali oleh Website Customer
  allProducts = filteredAdmin.map(p => ({
    id: p.id || Math.random(), 
    name: p.nama,
    price: parseInt(p.harga),
    category: "clothes", 
    icon: "👕", 
    discount: 0, 
    sold: 0, 
    // Jika gambar adalah URL (http), gunakan langsung. Jika tidak, arahkan ke folder assets.
    image: (p.gambar && p.gambar.startsWith('http')) ? p.gambar : `../assets/img/${p.gambar}`, 
    stock: p.stok
  }));

  // Fallback: Jika data admin kosong, tampilkan produk contoh
  if (allProducts.length === 0 && produkAdmin.length === 0) {
    allProducts = [
      { id: 1, name: "Kaos Basic Hitam", price: 45000, category: "clothes", icon: "👕", discount: 20, sold: 342, image: "", stock: 10 },
      { id: 2, name: "Kaos Basic Putih", price: 45000, category: "clothes", icon: "👕", discount: 0, sold: 218, image: "", stock: 10 },
      { id: 3, name: "Hoodie Cream", price: 130000, category: "clothes", icon: "🧥", discount: 10, sold: 267, image: "", stock: 10 }
    ];
  }

  renderProductsGrid(allProducts);
}

function renderProductsGrid(products) {
  const container = document.getElementById("product-list");
  if (!container) return;
  container.innerHTML = "";

  products.forEach(product => {
    const discount = product.discount || 0;
    const originalPrice = Math.round(product.price / (1 - discount/100));

    const div = document.createElement("div");
    div.className = "product-card";
    div.innerHTML = `
      <div class="product-image">
        ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://via.placeholder.com/200'">` : `<div class="image-placeholder">${product.icon}</div>`}
        ${discount > 0 ? `<div class="discount-badge">-${discount}%</div>` : ''}
      </div>
      <div class="product-body">
        <h3 class="product-name">${product.name}</h3>
        <div class="product-rating">⭐ 4.8 • ${product.sold} terjual • Stok: ${product.stock || 0}</div>
        <div class="product-price">
          ${discount > 0 ? `<span class="original-price">Rp ${originalPrice.toLocaleString('id-ID')}</span>` : ''}
          <span class="current-price">Rp ${product.price.toLocaleString('id-ID')}</span>
        </div>
        <button onclick="addToCart('${product.name}', ${product.price})" 
                ${product.stock <= 0 ? 'disabled style="background:#94a3b8; cursor:not-allowed;"' : ''}>
          ${product.stock <= 0 ? 'Habis' : '+ Keranjang'}
        </button>
      </div>
    `;
    container.appendChild(div);
  });
}

// ================= CART LOGIC =================

function addToCart(name, price) {
  const product = allProducts.find(p => p.name === name);
  if (!product) return alert('Produk tidak ditemukan!');
  if (product.stock <= 0) return alert('Stok produk habis!');

  const existing = cart.find(item => item.name === name);

  if (existing) {
    if (existing.qty >= product.stock) return alert('Stok tidak mencukupi!');
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }

  updateCartUI();
  saveCart();
}

function decreaseQty(name) {
  const item = cart.find(i => i.name === name);
  if (item.qty > 1) {
    item.qty--;
  } else {
    cart = cart.filter(i => i.name !== name);
  }
  updateCartUI();
  saveCart();
}

function increaseQty(name) {
  const item = cart.find(i => i.name === name);
  const product = allProducts.find(p => p.name === name);
  
  if (item.qty < product.stock) {
    item.qty++;
    updateCartUI();
    saveCart();
  } else {
    alert("Batas stok tercapai!");
  }
}

function removeItem(name) {
  cart = cart.filter(i => i.name !== name);
  updateCartUI();
  saveCart();
}

function saveCart() { localStorage.setItem('cart', JSON.stringify(cart)); }

function loadCart() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) cart = JSON.parse(savedCart);
  updateCartUI();
}

function updateCartUI() {
  const cartDrawerItemsEl = document.getElementById("cartDrawerItems");
  const navCartBadge = document.getElementById("navCartBadge");
  const totalDrawerEl = document.getElementById("totalDrawer");

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  if (navCartBadge) navCartBadge.textContent = totalItems;

  total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  if (totalDrawerEl) totalDrawerEl.textContent = total.toLocaleString("id-ID");

  if (!cartDrawerItemsEl) return;
  cartDrawerItemsEl.innerHTML = "";

  if (cart.length === 0) {
    cartDrawerItemsEl.innerHTML = `
      <div class="empty-cart-view" style="text-align: center; padding: 4rem 1rem; color: #6b7280;">
        <p>Keranjang Anda Kosong</p>
      </div>`;
    return;
  }

  cart.forEach(item => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item-sidebar";
    itemDiv.innerHTML = `
      <div style="flex:1">
        <h4 style="margin:0; font-size:0.9rem;">${item.name}</h4>
        <small>Rp ${item.price.toLocaleString("id-ID")} x ${item.qty}</small>
      </div>
      <div class="cart-item-actions" style="display:flex; align-items:center; gap:5px;">
        <button onclick="decreaseQty('${item.name}')" class="qty-btn">-</button>
        <span>${item.qty}</span>
        <button onclick="increaseQty('${item.name}')" class="qty-btn">+</button>
        <button onclick="removeItem('${item.name}')" style="background:none; border:none; color:red; cursor:pointer; margin-left:10px;">✕</button>
      </div>
    `;
    cartDrawerItemsEl.appendChild(itemDiv);
  });
}

// ================= UI INTERACTION =================

function toggleCartDrawer(event) {
  if (event) event.preventDefault();
  document.getElementById('cartDrawer').classList.toggle('open');
  document.getElementById('cartDrawerOverlay').classList.toggle('open');
}

function closeCartDrawer() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartDrawerOverlay').classList.remove('open');
}

function checkout() {
  if (cart.length === 0) return alert('Keranjang kosong!');
  window.location.href = 'checkout.html';
}

// ================= FILTER & SEARCH =================

let currentSort = 'terbaru';
let currentCategory = 'all';

function applyFilters() {
  const searchTerm = document.getElementById('search').value.toLowerCase();
  
  let filtered = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm)
  );

  if (currentCategory !== 'all') {
    if (currentCategory === 'sale') {
      filtered = filtered.filter(p => (p.discount || 0) > 0);
    } else {
      filtered = filtered.filter(p => p.category && p.category.includes(currentCategory));
    }
  }
  
  sortProducts(currentSort, filtered);
}

function searchProduct() { applyFilters(); }

function sortProducts(sortType, productsToSort = null) {
  currentSort = sortType;
  let products = productsToSort || allProducts;
  let sorted = [...products];
  
  switch(sortType) {
    case 'terbaru': sorted.sort((a, b) => b.id - a.id); break;
    case 'terlaris': sorted.sort((a, b) => b.sold - a.sold); break;
    case 'harga-terendah': sorted.sort((a, b) => a.price - b.price); break;
    case 'diskon': sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0)); break;
  }
  
  renderProductsGrid(sorted);
  
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.sort === sortType);
  });
}

// ================= INITIALIZATION =================

document.addEventListener("DOMContentLoaded", () => {
  loadProductsSimple();
  loadCart();

  // Filter Event Listeners
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSort = btn.dataset.sort;
      applyFilters();
    });
  });

  // Category Event Listeners
  document.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.category-item').forEach(c => c.classList.remove('active'));
      item.classList.add('active');
      currentCategory = item.dataset.category;
      applyFilters();
    });
  });
});