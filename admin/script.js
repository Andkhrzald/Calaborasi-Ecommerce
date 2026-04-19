<<<<<<< HEAD
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
=======
const getData = (key) => JSON.parse(localStorage.getItem(key)) || [];
const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

let charts = {};

// --- NAVIGATION ---
function changePage(pageName) {
    document.querySelectorAll('.content-page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    
    document.getElementById('page-' + pageName).style.display = 'block';
    document.getElementById('menu-' + pageName).classList.add('active');

>>>>>>> 36536c688beb4bd187b2de7784b027990579de60
    if (pageName === 'overview') renderOverview();
    if (pageName === 'inventory') renderInventory();
    if (pageName === 'orders') renderOrders();
    if (pageName === 'sales') renderSalesPage();
<<<<<<< HEAD
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
=======
>>>>>>> 36536c688beb4bd187b2de7784b027990579de60
}

// --- OVERVIEW ---
function renderOverview() {
    const sales = getData("laporan_penjualan");
    const produk = getData("produk_clothing");
    const pending = getData("antrean_pesanan");

    const total = sales.reduce((a, b) => a + (Number(b.hargaJual) || 0), 0);
    document.getElementById("ov-total-omset").innerText = `Rp ${total.toLocaleString()}`;
    document.getElementById("ov-stok-low").innerText = produk.filter(p => Number(p.stok) < 5).length;
    document.getElementById("ov-pending").innerText = pending.length;

    const sorted = [...produk].sort((a, b) => Number(a.stok) - Number(b.stok)).slice(0, 5);
    document.getElementById("tabel-populer").innerHTML = sorted.map(p => `
        <tr>
            <td><img src="${p.gambar}" width="35" height="35" style="border-radius:6px; object-fit:cover;"></td>
            <td>${p.nama}</td>
            <td>Rp ${Number(p.harga).toLocaleString()}</td>
            <td><b style="color:${Number(p.stok) < 5 ? '#ef4444' : '#10b981'}">${p.stok}</b></td>
        </tr>`).join("");
    
    updateMainChart(sales);
}

// --- INVENTORY ---
function renderInventory() {
    const tbody = document.getElementById("tabel-body");
    const data = getData("produk_clothing");
    
    tbody.innerHTML = data.map((p, i) => {
        const curStok = Number(p.stok);
        const isLow = curStok < 5;
        let sTxt = isLow ? "Stok Menipis ⚠️" : "Aman ✅";
        let sCol = isLow ? "#f59e0b" : "#10b981";
        if(p.hidden) { sTxt = "Hidden 🚫"; sCol = "#94a3b8"; }

        return `
        <tr style="opacity: ${p.hidden ? '0.5' : '1'}">
            <td><img src="${p.gambar}" width="40" height="40" style="object-fit:cover; border-radius:8px;"></td>
            <td>${p.nama}</td>
            <td>Rp ${Number(p.harga).toLocaleString()}</td>
            <td><b>${curStok}</b></td>
            <td><span style="color:${sCol}; font-size:12px; font-weight:bold; background:${sCol}11; padding:4px 8px; border-radius:5px; border:1px solid ${sCol}33;">${sTxt}</span></td>
            <td>
                <div style="display:flex; gap:8px;">
                    <button onclick="openModal(${i})" style="background:rgba(59,130,246,0.1); border:1px solid #3b82f6; color:#3b82f6; padding:5px 10px; border-radius:6px; cursor:pointer;">Edit</button>
                    <button onclick="toggleHide(${i})" style="background:rgba(148,163,184,0.1); border:1px solid #94a3b8; color:#94a3b8; padding:5px 10px; border-radius:6px; cursor:pointer;">${p.hidden ? 'Show' : 'Hide'}</button>
                </div>
            </td>
        </tr>`;
    }).join("");
}

function tambahProduk() {
    const n = document.getElementById("nama").value, h = document.getElementById("harga").value, s = document.getElementById("stok").value, g = document.getElementById("gambar").value;
    if(!n || !h || !s) return alert("Lengkapi data!");
    let list = getData("produk_clothing");
    list.push({ nama: n, harga: Number(h), stok: Number(s), gambar: g || 'https://via.placeholder.com/150', hidden: false });
    saveData("produk_clothing", list);
    renderInventory();
    ["nama", "harga", "stok", "gambar"].forEach(id => document.getElementById(id).value = "");
}

// --- ORDERS LOGIC ---
function renderOrders() {
    const antrean = getData("antrean_pesanan");
    const rej = getData("pesanan_reject");
    const app = getData("laporan_penjualan");

    // Tabel Pending
    document.getElementById("tabel-order-approval").innerHTML = antrean.map((item, i) => `
        <tr>
            <td><small>${item.tanggal}</small></td>
            <td>${item.namaProduk}</td>
            <td>Rp ${Number(item.hargaJual).toLocaleString()}</td>
            <td>
                <button onclick="showDetail(${i})" class="btn-blue">Detail</button>
                <button onclick="approveOrder(${i})" class="btn-green">Approve</button>
                <button onclick="rejectOrder(${i})" class="btn-red">Reject</button>
            </td>
        </tr>`).join("");

    // Tabel Reject
    document.getElementById("tabel-order-reject").innerHTML = [...rej].reverse().map((item, i) => `
        <tr>
            <td><small>${item.tanggal}</small></td>
            <td>${item.namaProduk}</td>
            <td style="color:#ef4444; font-size:11px;"><i>${item.alasan}</i></td>
            <td><button onclick="hapusReject(${i})" style="background:none; border:none; color:#ef4444; cursor:pointer;">🗑️</button></td>
        </tr>`).join("");

    // Tabel History Success
    document.getElementById("tabel-order-history-approve").innerHTML = [...app].reverse().slice(0, 10).map((item) => {
        const originalIdx = app.findIndex(x => x === item);
        return `<tr>
            <td><small>${item.tanggal}</small></td>
            <td>${item.namaProduk}</td>
            <td>Rp ${Number(item.hargaJual).toLocaleString()}</td>
            <td><button onclick="printStruk(${originalIdx})" style="background:#6366f1; color:white; border:none; padding:5px 12px; border-radius:5px; cursor:pointer;">Nota 🖨️</button></td>
        </tr>`;
    }).join("");
}

function approveOrder(i) {
    let antrean = getData("antrean_pesanan"), app = getData("laporan_penjualan"), prod = getData("produk_clothing");
    const item = antrean[i];
    
    // Potong Stok
    let pIdx = prod.findIndex(p => p.nama === item.namaProduk);
    if(pIdx !== -1 && Number(prod[pIdx].stok) > 0) { 
        prod[pIdx].stok = Number(prod[pIdx].stok) - 1; 
        saveData("produk_clothing", prod); 
    }
    
    app.push(item); 
    saveData("laporan_penjualan", app);
    antrean.splice(i, 1); 
    saveData("antrean_pesanan", antrean);
    renderOrders(); renderOverview();
}

function rejectOrder(i) {
    const al = prompt("Alasan Penolakan:");
    if(al === null) return;
    let antrean = getData("antrean_pesanan"), rej = getData("pesanan_reject");
    let item = antrean[i]; 
    item.alasan = al || "Dibatalkan Admin";
    rej.push(item); 
    saveData("pesanan_reject", rej);
    antrean.splice(i, 1); 
    saveData("antrean_pesanan", antrean);
    renderOrders();
}

// --- SALES ---
function renderSalesPage() {
    const sales = getData("laporan_penjualan");
    const total = sales.reduce((a, b) => a + (Number(b.hargaJual) || 0), 0);
    document.getElementById("sales-period-total").innerText = `Rp ${total.toLocaleString()}`;
    
    document.getElementById("tabel-history-30hari").innerHTML = [...sales].reverse().map(s => `
        <tr><td>${s.tanggal}</td><td>${s.namaProduk}</td><td>Rp ${Number(s.hargaJual).toLocaleString()}</td><td><b style="color:#10b981">Sukses</b></td></tr>
    `).join("");

    const labels = sales.map(s => s.tanggal.split(',')[0]).slice(-7);
    const values = sales.map(s => s.hargaJual).slice(-7);
    drawChart('detailedSalesChart', labels, values, '#10b981');
}

// --- PRINT NOTA (CLEAN DESIGN) ---
function printStruk(i) {
    const d = getData("laporan_penjualan")[i];
    const win = window.open('', '', 'width=450,height=600');
    
    const css = `<style>
        body { font-family: 'Courier New', monospace; padding: 25px; color: #333; }
        .box { width: 100%; max-width: 280px; margin: auto; border: 1px solid #eee; padding: 15px; }
        .h { text-align: center; border-bottom: 2px dashed #333; padding-bottom: 10px; margin-bottom: 15px; }
        .row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
        .f { text-align: center; border-top: 2px dashed #333; padding-top: 10px; margin-top: 20px; font-size: 12px; }
    </style>`;

    const html = `<div class="box">
        <div class="h"><h2>ELVOO</h2><small>EXECUTIVE CLOTHING</small></div>
        <div class="row"><span>Tanggal:</span><span>${d.tanggal}</span></div>
        <div class="row"><span>ID:</span><span>#EV-${Math.floor(Math.random()*1000)}</span></div>
        <hr>
        <div class="row"><b>${d.namaProduk}</b><span>${Number(d.hargaJual).toLocaleString()}</span></div>
        <div class="row" style="margin-top:15px; font-size:18px;"><b>TOTAL</b><b>Rp ${Number(d.hargaJual).toLocaleString()}</b></div>
        <div class="f"><p>Thank you for your purchase!</p><p>WWW.ELVOO.COM</p></div>
    </div>`;

    win.document.write(`<html><head>${css}</head><body>${html}<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();}}</script></body></html>`);
    win.document.close();
}

// --- CHART UTILS ---
function drawChart(id, labels, data, color) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: [{ data, borderColor: color, tension: 0.4, fill: true, backgroundColor: color + '22' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function updateMainChart(sales) {
    const labels = []; const values = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const t = d.toLocaleDateString('id-ID');
        labels.push(t);
        const dly = sales.filter(s => s.tanggal && s.tanggal.includes(t)).reduce((a, b) => a + (Number(b.hargaJual) || 0), 0);
        values.push(dly);
    }
    drawChart('salesChartOverview', labels, values, '#3b82f6');
}

// --- MODAL UTILS ---
function openModal(i) {
    const p = getData("produk_clothing")[i];
    document.getElementById("modal-nama").value = p.nama;
    document.getElementById("modal-harga").value = p.harga;
    document.getElementById("modal-stok").value = p.stok;
    document.getElementById("modal-index").value = i;
    document.getElementById("modal-edit").style.display = "flex";
}
function closeModal() { document.getElementById("modal-edit").style.display = "none"; }
function simpanPerubahanModal() {
    let list = getData("produk_clothing"), i = document.getElementById("modal-index").value;
    list[i].nama = document.getElementById("modal-nama").value;
    list[i].harga = Number(document.getElementById("modal-harga").value);
    list[i].stok = Number(document.getElementById("modal-stok").value);
    saveData("produk_clothing", list); renderInventory(); closeModal(); renderOverview();
}

function showDetail(i) {
    const d = getData("antrean_pesanan")[i];
    document.getElementById("content-detail").innerHTML = `<p><b>Produk:</b> ${d.namaProduk}</p><p><b>Alamat:</b> ${d.alamat || '-'}</p><p><b>Catatan:</b> ${d.catatan || '-'}</p>`;
    document.getElementById("modal-detail").style.display = "flex";
}
function closeDetail() { document.getElementById("modal-detail").style.display = "none"; }
function toggleHide(i) {
    let list = getData("produk_clothing"); list[i].hidden = !list[i].hidden;
    saveData("produk_clothing", list); renderInventory();
}
function hapusReject(i) {
    let r = getData("pesanan_reject"); r.splice(i, 1);
    saveData("pesanan_reject", r); renderOrders();
}
function logout() { if(confirm("Logout dari sistem Elvoo?")) window.location.href = "login.html"; }

<<<<<<< HEAD
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
=======
window.onload = () => changePage('overview');
>>>>>>> 36536c688beb4bd187b2de7784b027990579de60
