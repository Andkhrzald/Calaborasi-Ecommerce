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

// Load cart from localStorage or redirect if empty
async function loadCart() {
  await loadProducts();

  const savedCart = localStorage.getItem('cart');
  const customerName = localStorage.getItem('customerName');

  if (savedCart) {
    cart = JSON.parse(savedCart);
    total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    renderOrderSummary();

    if (customerName) {
      document.getElementById('name').value = customerName;
    }
  } else {
    alert('Keranjang kosong. Kembali ke halaman utama.');
    window.location.href = 'index.html';
  }
}

function renderOrderSummary() {
  const container = document.getElementById('order-items');
  container.innerHTML = '';

  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'checkout-item';

    const product = allProducts.find(p => p.name === item.name);
    const image = product ? product.image : '';

    div.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem;">
        <img src="${image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
        <div>
          <h4 style="margin: 0; font-size: 1rem; color: #212529;">${item.name}</h4>
          <p style="margin: 0.25rem 0; color: #6c757d; font-size: 0.9rem;">Rp ${formatRupiah(item.price)} x ${item.qty}</p>
        </div>
      </div>
      <div style="font-weight: 600; color: #007bff;">Rp ${formatRupiah(item.price * item.qty)}</div>
    `;
    container.appendChild(div);
  });

  document.getElementById('checkout-total').textContent = formatRupiah(total);
}

function formatRupiah(number) {
  return number.toLocaleString('id-ID');
}

document.getElementById('checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const customerData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    notes: document.getElementById('notes').value
  };

  // Simpan pesanan ke antrean admin
  let antrean = JSON.parse(localStorage.getItem("antrean_pesanan")) || [];
  cart.forEach(item => {
    antrean.push({
      tanggal: new Date().toLocaleString(),
      namaProduk: item.name + " (x" + item.qty + ")",
      hargaJual: item.price * item.qty
    });
  });
  localStorage.setItem("antrean_pesanan", JSON.stringify(antrean));

  alert('✅ Pesanan berhasil!');
  localStorage.removeItem('cart');
  window.location.href = '../../admin/login.html';
});

loadCart();