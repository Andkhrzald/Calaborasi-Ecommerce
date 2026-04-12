// --- 1. CONFIG & AUTH ---
const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
if (!user) window.location.href = "login.html";

document.getElementById("user-display").innerText = user.username;
document.getElementById("role-display").innerText = "Jabatan: " + (user.role || "Admin");

const getProduk = () => JSON.parse(localStorage.getItem("produk_clothing")) || [];
let myChart = null;

// --- 2. NAVIGASI ---
function changePage(pageName) {
    document.querySelectorAll('.content-page').forEach(p => p.style.display = 'none');
    const target = document.getElementById('page-' + pageName);
    if (target) target.style.display = 'block';
    
    if (pageName === 'inventory') renderInventory();
    if (pageName === 'orders') renderOrders();
    if (pageName === 'sales') {
        renderPenjualan();
        updateChartRange();
        updateBestSeller();
    }
}

// --- 3. INVENTORY LOGIC ---
function renderInventory() {
    const tbody = document.getElementById("tabel-body");
    tbody.innerHTML = getProduk().map((p, i) => `
        <tr>
            <td><img src="../assets/img/${p.gambar}" width="40" height="40" style="object-fit:cover; border-radius:4px;"></td>
            <td>${p.nama}</td>
            <td>Rp ${parseInt(p.harga).toLocaleString()}</td>
            <td>${p.stok} Pcs</td>
            <td><button onclick="openModal(${i})">⚙️ Edit</button></td>
        </tr>
    `).join("");
}

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
        ["nama","harga","stok","gambar"].forEach(id => document.getElementById(id).value = "");
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
                <button onclick="approveOrder(${index})" style="background:#10b981; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Approve</button>
                <button onclick="rejectOrder(${index})" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Reject</button>
            </td>
        </tr>
    `).join("");
}

function approveOrder(index) {
    let antrean = JSON.parse(localStorage.getItem("antrean_pesanan")) || [];
    let penghasilan = JSON.parse(localStorage.getItem("laporan_penjualan")) || [];
    penghasilan.push(antrean[index]);
    localStorage.setItem("laporan_penjualan", JSON.stringify(penghasilan));
    antrean.splice(index, 1);
    localStorage.setItem("antrean_pesanan", JSON.stringify(antrean));
    renderOrders();
}

function rejectOrder(index) {
    if(confirm("Tolak pesanan ini?")) {
        let antrean = JSON.parse(localStorage.getItem("antrean_pesanan")) || [];
        antrean.splice(index, 1);
        localStorage.setItem("antrean_pesanan", JSON.stringify(antrean));
        renderOrders();
    }
}

// --- 5. SALES & BEST SELLER LOGIC ---
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
        itemDate.setHours(0,0,0,0); start.setHours(0,0,0,0); end.setHours(0,0,0,0);
        return itemDate >= start && itemDate <= end;
    });

    tbody.innerHTML = filteredData.map((s, idx) => {
        total += s.hargaJual;
        return `<tr>
            <td><small>${s.tanggal}</small></td>
            <td>${s.namaProduk}</td>
            <td>Rp ${s.hargaJual.toLocaleString()}</td>
            <td>
                <button onclick="bukaDetailSales(${idx})" style="background:#007bff; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">👁️ Detail</button>
                <button onclick="hapusRiwayat(${idx})" style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">🗑️ Hapus</button>
            </td>
        </tr>`;
    }).reverse().join("");

    totalDisplay.innerText = `Rp ${total.toLocaleString()}`;
}

function updateBestSeller() {
    const dataSales = JSON.parse(localStorage.getItem("laporan_penjualan")) || [];
    const container = document.getElementById("best-seller-container");
    if (!container) return;

    if (dataSales.length === 0) {
        container.innerHTML = "<p style='color:#888;'>Belum ada data.</p>";
        return;
    }

    const counts = {};
    dataSales.forEach(s => {
        if (s.namaProduk) {
            const items = s.namaProduk.split(",");
            items.forEach(item => {
                let cleanName = item.replace(/\s*\(\s*x\d+\s*\)\s*/gi, "").trim();
                if (cleanName) counts[cleanName] = (counts[cleanName] || 0) + 1;
            });
        }
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
    container.innerHTML = sorted.map(([n, j], i) => `
        <div style="flex:1; min-width:140px; background:#f8fafc; padding:15px; border-radius:8px; border-left:4px solid #007bff; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <span style="font-size:1.2rem;">${i==0?'🥇':i==1?'🥈':'🥉'}</span>
            <div style="font-weight:bold; color:#1e293b; margin-top:5px;">${n}</div>
            <small style="color:#64748b;">Terjual ${j}x</small>
        </div>
    `).join("");
}

function bukaDetailSales(idx) {
    const dataSales = JSON.parse(localStorage.getItem("laporan_penjualan")) || [];
    // Data di-reverse di tabel, jadi kita ambil data asli yang benar
    const realData = [...dataSales].reverse()[idx]; 
    if(!realData) return;

    const container = document.getElementById("isi-detail-sales");
    const totalContainer = document.getElementById("total-detail-sales");

    const items = realData.namaProduk.split(",");
    let html = "";
    items.forEach(item => {
        const nama = item.split("(")[0].trim();
        const qty = item.match(/\(x(\d+)\)/) ? item.match(/\(x(\d+)\)/)[1] : "1";
        html += `
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span style="color:#475569;">${nama} <strong>(x${qty})</strong></span>
                <span style="color:#1e293b;">Rincian</span>
            </div>`;
    });

    container.innerHTML = html;
    totalContainer.innerHTML = `Total: Rp ${realData.hargaJual.toLocaleString()}`;
    document.getElementById("modal-detail-sales").style.display = "block";
}

function hapusRiwayat(idx) {
    if (confirm("Hapus transaksi ini dari riwayat?")) {
        let dataSales = JSON.parse(localStorage.getItem("laporan_penjualan")) || [];
        const reversedIdx = dataSales.length - 1 - idx;
        dataSales.splice(reversedIdx, 1);
        localStorage.setItem("laporan_penjualan", JSON.stringify(dataSales));
        renderPenjualan();
        updateBestSeller();
        updateChartRange();
    }
}

function updateChartRange() {
    const range = parseInt(document.getElementById('chart-range').value);
    const dataSales = JSON.parse(localStorage.getItem("laporan_penjualan")) || [];
    const labels = []; const dataValues = [];
    for (let i = range - 1; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const labelDate = d.toLocaleDateString('id-ID'); 
        labels.push(labelDate);
        const total = dataSales.filter(s => s.tanggal.startsWith(labelDate)).reduce((sum, s) => sum + s.hargaJual, 0);
        dataValues.push(total);
    }
    initChart(labels, dataValues);
}

function initChart(l, v) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'line',
        data: { labels: l, datasets: [{ label: 'Rp', data: v, borderColor: '#007bff', backgroundColor: 'rgba(0,123,255,0.1)', fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function resetFilter() {
    document.getElementById("filter-start").value = "";
    document.getElementById("filter-end").value = "";
    renderPenjualan();
}

function logout() { sessionStorage.clear(); window.location.href = "login.html"; }
function closeModalDetail() { document.getElementById("modal-detail-sales").style.display = "none"; }

// --- 6. MODAL INVENTORY LOGIC ---
function openModal(i) {
    const p = getProduk()[i];
    document.getElementById("modal-nama").value = p.nama;
    document.getElementById("modal-harga").value = p.harga;
    document.getElementById("modal-stok").value = p.stok;
    document.getElementById("modal-gambar").value = p.gambar;
    document.getElementById("modal-index").value = i;
    document.getElementById("modal-edit").style.display = "block";
}
function closeModal() { document.getElementById("modal-edit").style.display = "none"; }

function simpanPerubahanModal() {
    const i = document.getElementById("modal-index").value;
    let data = getProduk();
    data[i] = { 
        ...data[i], 
        nama: document.getElementById("modal-nama").value,
        harga: parseInt(document.getElementById("modal-harga").value),
        stok: parseInt(document.getElementById("modal-stok").value),
        gambar: document.getElementById("modal-gambar").value
    };
    localStorage.setItem("produk_clothing", JSON.stringify(data));
    renderInventory(); closeModal();
}

function hapusProdukModal() {
    if(confirm("Hapus produk?")) {
        let data = getProduk();
        data.splice(document.getElementById("modal-index").value, 1);
        localStorage.setItem("produk_clothing", JSON.stringify(data));
        renderInventory(); closeModal();
    }
}

// Init Halaman Awal
changePage('inventory');