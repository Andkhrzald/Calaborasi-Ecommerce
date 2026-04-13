let cart = [];
let total = 0;
let allProducts = [];

// Load products from localStorage for image lookup
async function loadProducts() {
  const produkAdmin = JSON.parse(localStorage.getItem("produk_clothing")) || [];
  allProducts = produkAdmin.map(p => ({
    name: p.nama,
    image: `../assets/img/${p.gambar}`
  }));
}

function formatRupiah(number) {
  return number.toLocaleString('id-ID');
}

// Load cart from localStorage or redirect if empty
async function loadCart() {
  await loadProducts();
  const savedCart = localStorage.getItem('cart');
  
  if (savedCart) {
    cart = JSON.parse(savedCart);
    total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    renderOrderSummary();
  } else {
    showEmptyCartMessage();
  }
}

function showEmptyCartMessage() {
  // Create overlay backdrop
  const overlay = document.createElement('div');
  overlay.id = 'empty-cart-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.3s ease-in-out;
  `;

  // Create modal content
  overlay.innerHTML = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .empty-cart-modal {
        background: #fff;
        border-radius: 20px;
        padding: 2.5rem;
        max-width: 450px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        text-align: center;
        position: relative;
        animation: slideUp 0.4s ease-out;
      }
      .empty-cart-modal .close-btn {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #9ca3af;
        transition: color 0.2s;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .empty-cart-modal .close-btn:hover {
        color: #374151;
      }
      .empty-cart-modal .icon {
        font-size: 4rem;
        margin-bottom: 1.5rem;
        display: block;
      }
      .empty-cart-modal h2 {
        margin: 0 0 0.75rem;
        color: #1f2937;
        font-size: 1.75rem;
        font-weight: 700;
      }
      .empty-cart-modal p {
        margin: 0 0 2rem;
        color: #6b7280;
        font-size: 1rem;
        line-height: 1.5;
      }
      .empty-cart-modal .actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
      }
      .empty-cart-modal .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 999px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        text-decoration: none;
        display: inline-block;
        font-size: 1rem;
      }
      .empty-cart-modal .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
      }
      .empty-cart-modal .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
      }
      .empty-cart-modal .btn-secondary {
        background: #e5e7eb;
        color: #374151;
      }
      .empty-cart-modal .btn-secondary:hover {
        background: #d1d5db;
      }
    </style>

    <div class="empty-cart-modal">
      <button class="close-btn" onclick="document.getElementById('empty-cart-overlay').remove()">✕</button>
      <span class="icon">🛒</span>
      <h2>Keranjang Kosong</h2>
      <p>Belum ada produk di keranjang Anda.<br>Mari mulai berbelanja dan temukan produk favorit Anda!</p>
      <div class="actions">
        <a href="website.html" class="btn btn-primary">Mulai Belanja</a>
        <button class="btn btn-secondary" onclick="document.getElementById('empty-cart-overlay').remove()">Tutup</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}

function renderOrderSummary() {
  const container = document.getElementById('order-items');
  if(!container) return;
  container.innerHTML = '';

  cart.forEach(item => {
    const product = allProducts.find(p => p.name === item.name);
    const image = product ? product.image : '';

    const div = document.createElement('div');
    div.className = 'checkout-item';
    div.style = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;";
    div.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem;">
        <img src="${image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
        <div>
          <h4 style="margin: 0; font-size: 0.9rem;">${item.name}</h4>
          <p style="margin: 0; color: #666; font-size: 0.8rem;">Rp ${formatRupiah(item.price)} x ${item.qty}</p>
        </div>
      </div>
      <div style="font-weight: 600; color: #007bff;">Rp ${formatRupiah(item.price * item.qty)}</div>
    `;
    container.appendChild(div);
  });

  document.getElementById('checkout-total').textContent = formatRupiah(total);
}

// PROSES SUBMIT FORM
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Data Customer dari Form
  const customerData = {
    nama: document.getElementById('name').value,
    email: document.getElementById('email').value,
    telp: document.getElementById('phone').value,
    alamat: document.getElementById('address').value,
    catatan: document.getElementById('notes').value || "-"
  };

  // 1. SIMPAN KE ANTREAN ADMIN (AGAR ADMIN BISA LIHAT DETAIL)
  let antrean = JSON.parse(localStorage.getItem("antrean_pesanan")) || [];
  
  // Gabungkan semua item keranjang jadi satu string untuk Admin
  const namaProdukGabung = cart.map(item => `${item.name} (x${item.qty})`).join(", ");

  antrean.push({
    tanggal: new Date().toLocaleString('id-ID'),
    namaProduk: namaProdukGabung,
    hargaJual: total,
    customer: customerData // PENTING: Key ini harus 'customer' agar dibaca Admin
  });
  localStorage.setItem("antrean_pesanan", JSON.stringify(antrean));

  // 2. SIMPAN KE RIWAYAT CUSTOMER (UNTUK TRACKING STATUS)
  const orderId = `ORD${Date.now()}`;
  const orderHistory = JSON.parse(localStorage.getItem('order_history')) || [];
  orderHistory.push({
    id: orderId,
    trackingCode: `TRK${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date().toISOString(),
    customer: customerData,
    items: cart,
    total: total,
  });
  localStorage.setItem('order_history', JSON.stringify(orderHistory));
  localStorage.setItem('last_order_id', orderId);

  alert('✅ Pesanan berhasil dikirim!');
  localStorage.removeItem('cart');
  window.location.href = `order-status.html?orderId=${encodeURIComponent(orderId)}`;
});

// Jalankan fungsi load
loadCart();