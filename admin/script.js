// --- 1. DATABASE ACCESS (LOCAL STORAGE) ---
function getData(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
        console.error("Gagal ambil data:", key);
        return [];
    }
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Global variable untuk menyimpan instance chart agar bisa di-destroy saat refresh
let charts = {};

// --- 2. AUTH & ROLE CHECK (BACKEND INTEGRATION) ---
function checkAuth() {
    fetch("./backend/check_session.php")
        .then(res => res.json())
        .then(data => {
            if (data.status !== "logged_in") {
                window.location.href = "login.html";
                return;
            }
            
            // Set nama user di UI
            const userDisp = document.getElementById("user-display");
            if (userDisp) userDisp.innerText = data.username || "Admin";

            // Logic Pembatasan Menu Berdasarkan Role
            const role = data.role;
            const menuInv = document.getElementById("menu-inventory");
            const menuOrders = document.getElementById("menu-orders");
            const menuSales = document.getElementById("menu-sales");

            if (role === "admin") {
                if (menuOrders) menuOrders.style.display = "none";
                if (menuSales) menuSales.style.display = "none";
            } else if (role === "staff") {
                if (menuInv) menuInv.style.display = "none";
                if (menuSales) menuSales.style.display = "none";
            }
        })
        .catch(err => console.log("Running in offline mode or backend not ready"));
}

// --- 3. NAVIGASI HALAMAN ---
function changePage(pageName) {
    // Sembunyikan semua page & matikan menu aktif
    document.querySelectorAll('.content-page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));

    // Tampilkan page yang dipilih
    const activePage = document.getElementById('page-' + pageName);
    if (activePage) activePage.style.display = 'block';

    const activeMenu = document.getElementById('menu-' + pageName);
    if (activeMenu) activeMenu.classList.add('active');

    // Trigger render data sesuai halaman
    if (pageName === 'overview') renderOverview();
    if (pageName === 'inventory') renderInventory();
    if (pageName === 'orders') renderOrders();
    if (pageName === 'sales') renderSalesPage();
}

// --- 4. INVENTORY LOGIC ---
function tambahProduk() {
    const n = document.getElementById("nama").value;
    const h = document.getElementById("harga").value;
    const s = document.getElementById("stok").value;
    const g = document.getElementById("gambar").value;

    if (!n || !h || !s) {
        alert("Nama, Harga, dan Stok wajib diisi!");
        return;
    }

    let pList = getData("produk_clothing");
    pList.push({
        id: Date.now(),
        nama: n,
        harga: parseInt(h),
        stok: parseInt(s),
        gambar: g || 'https://via.placeholder.com/150'
    });

    saveData("produk_clothing", pList);
    
    // Reset Form
    ["nama", "harga", "stok", "gambar"].forEach(id => document.getElementById(id).value = "");
    
    renderInventory();
    alert("Produk Berhasil Disimpan!");
}

function renderInventory() {
    const tbody = document.getElementById("tabel-body");
    const data = getData("produk_clothing");

    tbody.innerHTML = data.map((p, i) => `
        <tr>
            <td><img src="${p.gambar}" width="40" height="40" style="border-radius:5px; object-fit:cover;"></td>
            <td>${p.nama}</td>
            <td>Rp ${p.harga.toLocaleString()}</td>
            <td>${p.stok}</td>
            <td><button onclick="openModal(${i})" class="btn-filter">Edit</button></td>
        </tr>
    `).join("");
}

// --- 5. ORDER LOGIC ---
function renderOrders() {
    const antrean = getData("antrean_pesanan");
    const tbody = document.getElementById("tabel-order-approval");

    tbody.innerHTML = antrean.map((item, index) => `
        <tr>
            <td><small>${item.tanggal}</small></td>
            <td><strong>${item.namaProduk}</strong></td>
            <td>Rp ${item.hargaJual.toLocaleString()}</td>
            <td>
                <div style="display:flex; gap:5px;">
                    <button onclick="showDetail(${index})" style="background:#3b82f6; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Detail</button>
                    <button onclick="approveOrder(${index})" style="background:#10b981; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Approve</button>
                    <button onclick="rejectOrder(${index})" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Reject</button>
                </div>
            </td>
        </tr>
    `).join("");
}

function showDetail(index) {
    const item = getData("antrean_pesanan")[index];
    const content = document.getElementById("detail-content");
    if (item && item.customer) {
        content.innerHTML = `
            <p><strong>Nama:</strong> ${item.customer.nama}</p>
            <p><strong>WA:</strong> ${item.customer.telp}</p>
            <p><strong>Alamat:</strong> ${item.customer.alamat}</p>
            <p><strong>Catatan:</strong> ${item.customer.catatan || '-'}</p>
        `;
    } else {
        content.innerHTML = "<p>Info pelanggan tidak lengkap.</p>";
    }
    document.getElementById("modal-detail").style.display = "flex";
}

function approveOrder(index) {
    let antrean = getData("antrean_pesanan");
    let penghasilan = getData("laporan_penjualan");
    
    penghasilan.push(antrean[index]);
    saveData("laporan_penjualan", penghasilan);
    
    antrean.splice(index, 1);
    saveData("antrean_pesanan", antrean);
    
    renderOrders();
    alert("Pesanan disetujui!");
}

function rejectOrder(index) {
    if (confirm("Tolak pesanan ini?")) {
        let antrean = getData("antrean_pesanan");
        antrean.splice(index, 1);
        saveData("antrean_pesanan", antrean);
        renderOrders();
    }
}

// --- 6. SALES & DASHBOARD LOGIC ---
function renderOverview() {
    const sales = getData("laporan_penjualan");
    const produk = getData("produk_clothing");
    const orders = getData("antrean_pesanan");

    document.getElementById("ov-total-omset").innerText = `Rp ${sales.reduce((a, b) => a + (b.hargaJual || 0), 0).toLocaleString()}`;
    document.getElementById("ov-stok-low").innerText = produk.filter(p => p.stok < 5).length;
    document.getElementById("ov-pending").innerText = orders.length;

    // Chart Tren 7 Hari
    const labels = []; const values = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const t = d.toLocaleDateString('id-ID');
        labels.push(t);
        const totalHariIni = sales.filter(s => s.tanggal && s.tanggal.startsWith(t)).reduce((a, b) => a + (b.hargaJual || 0), 0);
        values.push(totalHariIni);
    }
    renderChart('salesChartOverview', 'line', labels, values, '#10b981');
}

function renderSalesPage() {
    const allSales = getData("laporan_penjualan");
    const start = document.getElementById("filter-start").value;
    const end = document.getElementById("filter-end").value;

    let filtered = allSales;
    if (start && end) {
        filtered = allSales.filter(s => {
            if (!s.tanggal) return false;
            const parts = s.tanggal.split(',')[0].split('/');
            const saleDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            return saleDate >= start && saleDate <= end;
        });
    }

    document.getElementById("sales-period-total").innerText = `Rp ${filtered.reduce((a, b) => a + (b.hargaJual || 0), 0).toLocaleString()}`;

    document.getElementById("tabel-terjual").innerHTML = filtered.map(s => `
        <tr><td>${s.tanggal}</td><td>${s.namaProduk}</td><td>Rp ${s.hargaJual.toLocaleString()}</td><td>Selesai</td></tr>
    `).reverse().join("");

    const daily = {};
    filtered.forEach(s => { const t = s.tanggal.split(',')[0]; daily[t] = (daily[t] || 0) + s.hargaJual; });
    renderChart('detailedSalesChart', 'bar', Object.keys(daily), Object.values(daily), '#10b981');
}

// --- 7. UNIVERSAL HELPERS ---
function renderChart(id, type, labels, data, color) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    if (charts[id]) charts[id].destroy();

    charts[id] = new Chart(canvas.getContext('2d'), {
        type: type,
        data: { labels, datasets: [{ data, borderColor: color, backgroundColor: color + '22', fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function openModal(i) {
    const p = getData("produk_clothing")[i];
    document.getElementById("modal-nama").value = p.nama;
    document.getElementById("modal-harga").value = p.harga;
    document.getElementById("modal-stok").value = p.stok;
    document.getElementById("modal-gambar").value = p.gambar;
    document.getElementById("modal-index").value = i;
    document.getElementById("modal-edit").style.display = "flex";
}

function closeModal() { document.getElementById("modal-edit").style.display = "none"; }
function closeDetail() { document.getElementById("modal-detail").style.display = "none"; }

function logout() {
    sessionStorage.clear();
    fetch("./backend/logout.php").finally(() => {
        window.location.href = "login.html";
    });
}

// --- INIT ON LOAD ---
window.onload = () => {
    checkAuth();
    changePage('overview');
};