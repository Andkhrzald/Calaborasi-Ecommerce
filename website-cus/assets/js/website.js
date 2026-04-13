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
  const produkAdmin = JSON.parse(localStorage.getItem("produk_clothing")) || [];
  
  // Map admin products to website format
  allProducts = produkAdmin.map(p => ({
    id: p.id,
    name: p.nama,
    price: parseInt(p.harga),
    category: "clothes", // Default category
    icon: "👕", // Default icon
    discount: 0, // Default discount
    sold: 0, // Default sold
    image: `../assets/img/${p.gambar}`, // Image path
    stock: p.stok
  }));

  // Fallback to hardcoded if no admin products
  if (allProducts.length === 0) {
    allProducts = [
      { id: 1, name: "Kaos Basic Hitam", price: 45000, category: "clothes", icon: "👕", discount: 20, sold: 342, image: "", stock: 10 },
      { id: 2, name: "Kaos Basic Putih", price: 45000, category: "clothes", icon: "👕", discount: 0, sold: 218, image: "", stock: 10 },
      { id: 3, name: "Kaos Oversized Hijau", price: 65000, category: "clothes", icon: "👕", discount: 15, sold: 156, image: "", stock: 10 },
      { id: 4, name: "Jaket Denim Biru", price: 180000, category: "clothes", icon: "🧥", discount: 25, sold: 89, image: "", stock: 10 },
      { id: 5, name: "Hoodie Cream", price: 130000, category: "clothes", icon: "🧥", discount: 10, sold: 267, image: "", stock: 10 },
      { id: 6, name: "Hoodie Black Premium", price: 150000, category: "clothes", icon: "🧥", discount: 20, sold: 195, image: "", stock: 10 },
      { id: 7, name: "Celana Jeans Slim", price: 120000, category: "clothes", icon: "👖", discount: 15, sold: 412, image: "", stock: 10 },
      { id: 8, name: "Celana Chino Khaki", price: 125000, category: "clothes", icon: "👖", discount: 0, sold: 203, image: "", stock: 10 },
      { id: 9, name: "Shirt Formal Biru", price: 95000, category: "clothes", icon: "👔", discount: 10, sold: 178, image: "", stock: 10 },
    ];
  }

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
        ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://via.placeholder.com/200'">` : `<div class="image-placeholder">${product.icon}</div>`}
        ${discount > 0 ? `<div class="discount-badge">-${discount}%</div>` : ''}
      </div>
      <div class="product-body">
        <h3 class="product-name">${product.name}</h3>
        <div class="product-rating">⭐ 4.8 • ${product.sold} terjual • Stok: ${product.stock || 'N/A'}</div>
        <div class="product-price">
          ${discount > 0 ? `<span class="original-price">Rp ${originalPrice.toLocaleString('id-ID')}</span>` : ''}
          <span class="current-price">Rp ${product.price.toLocaleString('id-ID')}</span>
        </div>
        <button onclick="addToCart('${product.name}', ${product.price})" ${product.stock <= 0 ? 'disabled' : ''}>+ Keranjang</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function addToCart(name, price) {
  const product = allProducts.find(p => p.name === name);
  if (!product) {
    alert('Produk tidak ditemukan!');
    return;
  }
  if (product.stock <= 0) {
    alert('Stok produk habis!');
    return;
  }

  const existing = cart.find(item => item.name === name);

  if (existing) {
    if (existing.qty >= product.stock) {
      alert('Stok tidak mencukupi!');
      return;
    }
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
  const cartDrawerItemsEl = document.getElementById("cartDrawerItems");
  const cartCount = document.getElementById("cartCount");
  const cartBadge = document.getElementById("cartBadge");
  const navCartBadge = document.getElementById("navCartBadge");
  const totalEl = document.getElementById("total");
  const totalDrawerEl = document.getElementById("totalDrawer");

  if (cartEl) cartEl.innerHTML = "";
  if (cartDrawerItemsEl) cartDrawerItemsEl.innerHTML = "";
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  if (cartCount) cartCount.textContent = totalItems;
  if (cartBadge) cartBadge.textContent = totalItems;
  if (navCartBadge) navCartBadge.textContent = totalItems;

  total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  if (totalEl) totalEl.textContent = formatRupiah(total);
  if (totalDrawerEl) totalDrawerEl.textContent = formatRupiah(total);

  if (cart.length === 0) {
    const emptyHtml = `
      <div class="empty-cart-view" style="text-align: center; padding: 4rem 1rem; color: #6b7280; display: flex; flex-direction: column; align-items: center;">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem; opacity: 0.5;">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <h4 style="font-size: 1.1rem; color: #374151; margin-bottom: 0.5rem; font-weight: 600;">Keranjang Anda Kosong</h4>
        <p style="font-size: 0.9rem; line-height: 1.5;">Anda belum menambahkan produk apapun.<br>Yuk, temukan produk menarik!</p>
      </div>
    `;
    if (cartEl) cartEl.innerHTML = emptyHtml;
    if (cartDrawerItemsEl) cartDrawerItemsEl.innerHTML = emptyHtml;

    document.querySelectorAll('.checkout-btn').forEach(btn => {
      btn.style.opacity = '0.5';
      btn.style.pointerEvents = 'none';
      btn.textContent = 'Keranjang Kosong';
    });
    return;
  }

  document.querySelectorAll('.checkout-btn').forEach(btn => {
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
    btn.textContent = '🚀 Checkout Sekarang';
  });

  const renderCartItems = (container) => {
    cart.forEach(item => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "cart-item-sidebar";
      itemDiv.innerHTML = `
        <div>
          <h4>${item.name}</h4>
          <div class="item-price">Rp ${formatRupiah(item.price)} x ${item.qty}</div>
          <div class="item-price" style="margin-top: 0.35rem; font-size: 0.85rem; color: #4b5563;">Subtotal: Rp ${formatRupiah(item.price * item.qty)}</div>
        </div>
        <div class="cart-item-actions">
          <button type="button" class="qty-btn decrease">-</button>
          <span>${item.qty}</span>
          <button type="button" class="qty-btn increase">+</button>
          <button type="button" class="remove-btn">✕</button>
        </div>
      `;

      itemDiv.querySelector('.decrease').addEventListener('click', () => decreaseQty(item.name));
      itemDiv.querySelector('.increase').addEventListener('click', () => increaseQty(item.name));
      itemDiv.querySelector('.remove-btn').addEventListener('click', () => removeItem(item.name));

      container.appendChild(itemDiv);
    });
  };

  if (cartEl) renderCartItems(cartEl);
  if (cartDrawerItemsEl) renderCartItems(cartDrawerItemsEl);
}

function toggleCartDrawer(event) {
  if (event) event.preventDefault();
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartDrawerOverlay');
  drawer.classList.toggle('open');
  overlay.classList.toggle('open');
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartDrawerOverlay');
  drawer.classList.remove('open');
  overlay.classList.remove('open');
}

function getLastOrderId() {
  const lastOrderId = localStorage.getItem('last_order_id');
  if (lastOrderId) return lastOrderId;

  const orderHistory = JSON.parse(localStorage.getItem('order_history')) || [];
  return orderHistory.length ? orderHistory[orderHistory.length - 1].id : null;
}

function updateOrderStatusLink() {
  const orderId = getLastOrderId();
  const link = document.getElementById('status-link');
  if (!link) return;

  if (orderId) {
    link.href = `order-status.html?orderId=${encodeURIComponent(orderId)}`;
    link.style.display = 'inline-block';
  } else {
    link.style.display = 'none';
  }
}

function showAlertModal(title, message, icon = '⚠️') {
  const modal = document.getElementById('alertModal');
  const overlay = document.getElementById('alertModalOverlay');
  const titleEl = document.getElementById('alertTitle');
  const messageEl = document.getElementById('alertMessage');
  const iconEl = document.getElementById('alertIcon');

  titleEl.textContent = title;
  messageEl.textContent = message;
  iconEl.textContent = icon;

  modal.classList.add('show');
  overlay.classList.add('show');
}

function closeAlertModal() {
  const modal = document.getElementById('alertModal');
  const overlay = document.getElementById('alertModalOverlay');
  modal.classList.remove('show');
  overlay.classList.remove('show');
}

function checkout() {
  if (cart.length === 0) {
    showAlertModal(
      '🛒 Keranjang Kosong!',
      'Silakan tambahkan produk ke keranjang sebelum melanjutkan ke checkout.',
      '📦'
    );
    return;
  }

  // Langsung ke halaman checkout customer.
  window.location.href = 'checkout.html';
}

let currentSort = 'terbaru';
let currentCategory = 'all';
let currentProducts = [];

function applyFilters() {
  const searchTerm = document.getElementById('search').value.toLowerCase();
  
  let filtered = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm)
  );

  if (currentCategory !== 'all') {
    if (currentCategory === 'sale') {
      filtered = filtered.filter(p => (p.discount || 0) > 0);
    } else {
      // Allow partial match like clothes_men matching clothes
      filtered = filtered.filter(p => p.category && p.category.includes(currentCategory));
    }
  }
  
  sortProducts(currentSort, filtered);
}

function searchProduct() {
  applyFilters();
}

function sortProducts(sortType, productsToSort = null) {
  currentSort = sortType;
  let products = productsToSort || allProducts;
  let sorted = [...products]; // Copy array to avoid mutation
  
  switch(sortType) {
    case 'terbaru':
      sorted.sort((a, b) => b.id - a.id); // Newest first
      break;
    case 'terlaris':
      sorted.sort((a, b) => b.sold - a.sold); // Most sold first
      break;
    case 'harga-terendah':
      sorted.sort((a, b) => a.price - b.price); // Lowest price first
      break;
    case 'diskon':
      sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0)); // Highest discount first
      break;
    default:
      sorted.sort((a, b) => b.id - a.id);
  }
  
  currentProducts = sorted;
  renderProductsGrid(sorted);
  
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.sort === sortType) {
      btn.classList.add('active');
    }
  });
}

// INIT
loadProductsSimple();
loadCart();
updateOrderStatusLink();

// Add event listeners to filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const sortType = btn.dataset.sort;
    currentSort = sortType;
    applyFilters();
  });
});

// Add event listeners to category items
document.querySelectorAll('.category-item').forEach(item => {
  item.addEventListener('click', () => {
    // Update active class
    document.querySelectorAll('.category-item').forEach(c => {
      c.classList.remove('active');
    });
    
    item.classList.add('active');
    
    currentCategory = item.dataset.category;
    applyFilters();
  });
});
