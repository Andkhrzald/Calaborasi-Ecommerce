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

    document.getElementById("ov-total-omset").innerText = `Rp ${sales.reduce((a,b) => a + (b.hargaJual || 0), 0).toLocaleString()}`;
    document.getElementById("ov-stok-low").innerText = produk.filter(p => p.stok < 5).length;
    document.getElementById("ov-pending").innerText = orders.length;

    // Chart Trend 7 Hari
    const labels = []; const values = [];
    for(let i=6; i>=0; i--) {
        const d = new Date(); d.setDate(d.getDate()-i);
        const t = d.toLocaleDateString('id-ID');
        labels.push(t);
        values.push(sales.filter(s => s.tanggal && s.tanggal.startsWith(t)).reduce((a,b) => a + (b.hargaJual || 0), 0));
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
            if(!s.tanggal) return false;
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

function logout() { sessionStorage.clear(); window.location.href = "login.html"; }

// --- INIT ---
window.onload = () => {
    changePage('overview');
};