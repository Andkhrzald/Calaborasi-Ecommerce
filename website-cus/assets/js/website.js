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