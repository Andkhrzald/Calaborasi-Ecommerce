function getOrderIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('orderId');
}

function getOrderHistory() {
  return JSON.parse(localStorage.getItem('order_history')) || [];
}

function formatRupiah(number) {
  return number.toLocaleString('id-ID');
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function deriveStatusStep(order) {
  const createdAt = order.createdAt ? new Date(order.createdAt).getTime() : Date.now();
  const diff = Date.now() - createdAt;

  if (diff < 20000) return 0;
  if (diff < 40000) return 1;
  if (diff < 60000) return 2;
  return 3;
}

function getStatusLabel(step) {
  return [
    'Pesanan diterima',
    'Sedang dipacking',
    'Sedang dikirim',
    'Sampai tujuan'
  ][step] || 'Pesanan diterima';
}

function renderOrderDetails(order) {
  document.getElementById('order-id').textContent = order.id;
  document.getElementById('order-code').textContent = order.trackingCode;
  document.getElementById('order-date').textContent = formatDate(order.createdAt);
  document.getElementById('order-status').textContent = getStatusLabel(deriveStatusStep(order));
  document.getElementById('order-total').textContent = formatRupiah(order.total);

  const container = document.getElementById('order-items');
  container.innerHTML = '';

  order.items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <div>
        <div class="item-name">${item.name}</div>
        <div class="small-text">Qty ${item.qty} × Rp ${formatRupiah(item.price)}</div>
      </div>
      <div>Rp ${formatRupiah(item.price * item.qty)}</div>
    `;
    container.appendChild(row);
  });
}

function renderTimeline(order) {
  const currentStep = deriveStatusStep(order);
  const steps = [
    { title: 'Pesanan diterima', description: 'Kami sudah menerima permintaan Anda.' },
    { title: 'Sedang dipacking', description: 'Barang sedang dikemas oleh tim kami.' },
    { title: 'Sedang dikirim', description: 'Kurir sedang dalam perjalanan ke alamat Anda.' },
    { title: 'Sampai tujuan', description: 'Pesanan telah sampai dan siap diterima.' }
  ];

  const container = document.getElementById('tracking-steps');
  container.innerHTML = '';

  steps.forEach((step, index) => {
    const stepEl = document.createElement('div');
    stepEl.className = 'step';
    stepEl.innerHTML = `
      <div class="step-marker ${index <= currentStep ? 'active' : ''}">${index + 1}</div>
      <div class="step-content">
        <h3>${step.title}</h3>
        <p>${step.description}</p>
      </div>
    `;
    container.appendChild(stepEl);
  });
}

function loadOrderStatus() {
  const orderId = getOrderIdFromURL();
  const history = getOrderHistory();
  let order = null;

  if (orderId) {
    order = history.find(o => o.id === orderId);
  }

  if (!order) {
    const lastOrderId = localStorage.getItem('last_order_id');
    if (lastOrderId) {
      order = history.find(o => o.id === lastOrderId);
    }
  }

  if (!order) {
    order = history[history.length - 1];
  }

  if (!order) {
    document.body.innerHTML = `
      <div style="max-width: 500px; margin: 4rem auto; text-align: center; padding: 2rem; background: #fff; border-radius: 18px; box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);">
        <h1>Belum ada pesanan</h1>
        <p>Pesanan Anda belum tersedia. Silakan kembali ke toko dan checkout terlebih dahulu.</p>
        <a href="website.html" style="display:inline-block; margin-top:1.5rem; padding:0.85rem 1.4rem; background:#2563eb; color:#fff; border-radius:999px; text-decoration:none;">Kembali Belanja</a>
      </div>
    `;
    return;
  }

  renderOrderDetails(order);
  renderTimeline(order);

  setInterval(() => {
    document.getElementById('order-status').textContent = getStatusLabel(deriveStatusStep(order));
    renderTimeline(order);
  }, 5000);
}

loadOrderStatus();
