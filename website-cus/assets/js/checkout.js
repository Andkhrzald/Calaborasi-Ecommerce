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
    alert('Keranjang kosong. Kembali ke halaman utama.');
    window.location.href = 'index.html';
  }
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