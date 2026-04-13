// --- 1. CONFIG & AUTH ---
// (Fake localStorage login removed. Awaiting backend integration for session checking)
// Backend will verify sessions automatically.


const getProduk = () => JSON.parse(localStorage.getItem("produk_clothing")) || [];

// Variabel Global untuk Chart
let myChart = null;
// --- DATABASE ACCESS ---
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

let charts = {};

// --- NAVIGASI ---
function changePage(pageName) {
    // Sembunyikan semua page & matikan menu aktif
    document.querySelectorAll('.content-page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.menu-item').forEach(m => m.style.background = 'transparent');
    document.getElementById('page-' + pageName).style.display = 'block';

    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));

    // Aktifkan page yang diklik
    const activePage = document.getElementById('page-' + pageName);
    if (activePage) activePage.style.display = 'block';

    const activeMenu = document.getElementById('menu-' + pageName);
    if (activeMenu) activeMenu.classList.add('active');

    // Refresh data per halaman
    if (pageName === 'overview') renderOverview();
    if (pageName === 'inventory') renderInventory();
    if (pageName === 'orders') renderOrders();
    if (pageName === 'sales') renderSalesPage();
}

// --- FITUR TAMBAH PRODUK ---
function tambahProduk() {
    const nama = document.getElementById("nama").value;
    const harga = document.getElementById("harga").value;
    const stok = document.getElementById("stok").value;
    const gambar = document.getElementById("gambar").value;

    if (!nama || !harga || !stok) {
        alert("Nama, Harga, dan Stok wajib diisi!");
        return;
    }

    let pList = getData("produk_clothing");
    pList.push({
        id: Date.now(),
        nama: nama,
        harga: parseInt(harga),
        stok: parseInt(stok),
        gambar: gambar || 'https://via.placeholder.com/150'
    });

    saveData("produk_clothing", pList);

    // Kosongkan Form
    document.getElementById("nama").value = "";
    document.getElementById("harga").value = "";
    document.getElementById("stok").value = "";
    document.getElementById("gambar").value = "";

    renderInventory();
    alert("Produk berhasil masuk!");
}

// --- RENDER INVENTORY ---
function renderInventory() {
    const tbody = document.getElementById("tabel-body");
    const data = getData("produk_clothing");

    tbody.innerHTML = data.map((p, i) => `
        <tr>
            <td><img src="${p.gambar}" width="40" height="40" style="border-radius:5px; object-fit:cover;"></td>
            <td>${p.nama}</td>
            <td>Rp ${p.harga.toLocaleString()}</td>
            <td>${p.stok}</td>
            <td><button onclick="openModal(${i})" style="color:#10b981; cursor:pointer; background:none; border:1px solid #10b981; padding:5px 10px; border-radius:5px;">Edit</button></td>
        </tr>
    `).join("");
}

// --- RENDER OVERVIEW ---
function renderOverview() {
    const sales = getData("laporan_penjualan");
    const produk = getData("produk_clothing");
    const orders = getData("antrean_pesanan");

    document.getElementById("ov-total-omset").innerText = `Rp ${sales.reduce((a, b) => a + (b.hargaJual || 0), 0).toLocaleString()}`;
    document.getElementById("ov-stok-low").innerText = produk.filter(p => p.stok < 5).length;
    document.getElementById("ov-pending").innerText = orders.length;

    // Chart Trend 7 Hari
    const labels = []; const values = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const t = d.toLocaleDateString('id-ID');
        labels.push(t);
        values.push(sales.filter(s => s.tanggal && s.tanggal.startsWith(t)).reduce((a, b) => a + (b.hargaJual || 0), 0));
    }
    renderChart('salesChartOverview', 'line', labels, values, '#10b981');
}

// --- PENGHASILAN ---
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

// --- UNIVERSAL CHART ---
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

// --- MODAL ---
function openModal(i) {
    const p = getData("produk_clothing")[i];
    document.getElementById("modal-nama").value = p.nama;
    document.getElementById("modal-harga").value = p.harga;
    document.getElementById("modal-stok").value = p.stok;
    document.getElementById("modal-gambar").value = p.gambar;
    document.getElementById("modal-index").value = i;
    document.getElementById("modal-edit").style.display = "block";
}

function closeModal() { document.getElementById("modal-edit").style.display = "none"; }

function tambahProduk() {
    const n = document.getElementById("nama").value,
        h = document.getElementById("harga").value,
        s = document.getElementById("stok").value,
        g = document.getElementById("gambar").value;
    if (n && h && s && g) {
        let data = getProduk();
        data.push({ id: Date.now(), nama: n, harga: parseInt(h), stok: parseInt(s), gambar: g });
        localStorage.setItem("produk_clothing", JSON.stringify(data));
        renderInventory();
        alert("Produk Berhasil Disimpan!");
        document.getElementById("nama").value = "";
        document.getElementById("harga").value = "";
        document.getElementById("stok").value = "";
        document.getElementById("gambar").value = "";
    }
}

// --- 4. ORDER LOGIC ---
function renderOrders() {
    const antrean = JSON.parse(localStorage.getItem("antrean_pesanan")) || [];
    const tbody = document.getElementById("tabel-order-approval");

    tbody.innerHTML = antrean.map((item, index) => `
        <tr>
            <td><small>${item.tanggal}</small></td>
            <td><strong>${item.namaProduk}</strong></td>
            <td>Rp ${item.hargaJual.toLocaleString()}</td>
            <td>
                <div style="display:flex; gap:5px; justify-content:center;">
                    <button onclick="showDetail(${index})" style="background:#007bff; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;">Detail</button>
                    <button onclick="approveOrder(${index})" style="background:#10b981; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;">Approve</button>
                    <button onclick="rejectOrder(${index})" style="background:#ef4444; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;">Reject</button>
                </div>
            </td>
        </tr>
    `).join("");
}

function showDetail(index) {
    const item = (JSON.parse(localStorage.getItem("antrean_pesanan")) || [])[index];
    const content = document.getElementById("detail-content");
    if (item && item.customer) {
        content.innerHTML = `
            <p><strong>Nama:</strong> ${item.customer.nama}</p>
            <p><strong>WA:</strong> ${item.customer.telp}</p>
            <p><strong>Alamat:</strong> ${item.customer.alamat}</p>
            <p><strong>Catatan:</strong> ${item.customer.catatan || '-'}</p>
        `;
    } else {
        content.innerHTML = "<p>Info customer tidak ditemukan (Data lama).</p>";
    }
    document.getElementById("modal-detail").style.display = "flex";
}

function closeDetail() { document.getElementById("modal-detail").style.display = "none"; }

function approveOrder(index) {
    let antrean = JSON.parse(localStorage.getItem("antrean_pesanan")) || [];
    let penghasilan = JSON.parse(localStorage.getItem("laporan_penjualan")) || [];
    penghasilan.push(antrean[index]);
    localStorage.setItem("laporan_penjualan", JSON.stringify(penghasilan));
    antrean.splice(index, 1);
    localStorage.setItem("antrean_pesanan", JSON.stringify(antrean));
    renderOrders();
    alert("Pesanan disetujui!");
}

function rejectOrder(index) {
    if (confirm("Tolak pesanan ini?")) {
        let antrean = JSON.parse(localStorage.getItem("antrean_pesanan")) || [];
        antrean.splice(index, 1);
        localStorage.setItem("antrean_pesanan", JSON.stringify(antrean));
        renderOrders();
    }
}

// --- 5. SALES & CHART LOGIC ---

function parseDate(dateStr) {
    const parts = dateStr.split(',')[0].split('/');
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

function renderPenjualan() {
    const dataSales = JSON.parse(localStorage.getItem("laporan_penjualan")) || [];
    const tbody = document.getElementById("tabel-penjualan");
    const totalDisplay = document.getElementById("total-duit");

    const startDate = document.getElementById("filter-start").value;
    const endDate = document.getElementById("filter-end").value;

    let total = 0;

    const filteredData = dataSales.filter(s => {
        if (!startDate || !endDate) return true;
        const itemDate = parseDate(s.tanggal);
        const start = new Date(startDate);
        const end = new Date(endDate);
        itemDate.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return itemDate >= start && itemDate <= end;
    });

    tbody.innerHTML = filteredData.map(s => {
        total += s.hargaJual;
        return `<tr><td>${s.tanggal}</td><td>${s.namaProduk}</td><td>Rp ${s.hargaJual.toLocaleString()}</td></tr>`;
    }).reverse().join("");

    totalDisplay.innerText = `Rp ${total.toLocaleString()}`;
}

// --- LOGIKA DIAGRAM (CHART) ---
function initChart(labels, dataValues) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Penghasilan (Rp)',
                data: dataValues,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { callback: v => 'Rp ' + v.toLocaleString() } }
            }
        }
    });
}

function updateChartRange() {
    const range = parseInt(document.getElementById('chart-range').value);
    const dataSales = JSON.parse(localStorage.getItem("laporan_penjualan")) || [];
    const labels = [];
    const dataValues = [];

    for (let i = range - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        // Format DD/MM/YYYY untuk mencocokkan dengan data
        const labelDate = d.toLocaleDateString('id-ID');
        labels.push(labelDate);

        const totalHariIni = dataSales
            .filter(s => s.tanggal.startsWith(labelDate))
            .reduce((sum, s) => sum + s.hargaJual, 0);

        dataValues.push(totalHariIni);
    }
    initChart(labels, dataValues);
}

function resetFilter() {
    document.getElementById("filter-start").value = "";
    document.getElementById("filter-end").value = "";
    renderPenjualan();
}

function logout() {
    fetch("./backend/logout.php")
        .then(() => {
            window.location.href = "login.html";
        });
}

// Ambil role dari session backend
fetch("./backend/check_session.php")
    .then(res => res.json())
    .then(data => {

        if (data.status !== "logged_in") {
            window.location.href = "login.html";
            return;
        }

        const role = data.role;

        // Ambil semua menu sesuai ID asli yang sudah ada di HTML Anda
        const menuInventory = document.getElementById("menu-inv");
        const menuOrders = document.getElementById("menu-orders");
        const menuIncome = document.getElementById("menu-sales");
        const menuWebsite = document.getElementById("menu-web");

        // Reset dulu (semua tampil)
        [menuInventory, menuOrders, menuIncome, menuWebsite].forEach(menu => {
            if (menu) menu.style.display = "block";
        });

        // 🔥 LOGIC ROLE

        if (role === "admin") {
            // Admin: hanya Inventory + Website
            if (menuOrders) menuOrders.style.display = "none";
            if (menuIncome) menuIncome.style.display = "none";
        }

        if (role === "staff") {
            // Staff: hanya Pesanan Masuk
            if (menuInventory) menuInventory.style.display = "none";
            if (menuIncome) menuIncome.style.display = "none";
            if (menuWebsite) menuWebsite.style.display = "none";
        }

        // Owner tidak perlu diapa-apakan (full akses)

    });

// --- INIT ---
window.onload = () => {
    changePage('overview');
};