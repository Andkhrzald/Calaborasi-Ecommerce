const getData = (key) => JSON.parse(localStorage.getItem(key)) || [];
const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

let charts = {};

// NAVIGATION
function changePage(pageName) {
    document.querySelectorAll('.content-page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    document.getElementById('page-' + pageName).style.display = 'block';
    document.getElementById('menu-' + pageName).classList.add('active');

    if (pageName === 'overview') renderOverview();
    if (pageName === 'inventory') renderInventory();
    if (pageName === 'orders') renderOrders();
    if (pageName === 'sales') renderSalesPage();
}

// ================= INVENTORY LOGIC (DENGAN FITUR HIDE) =================

function tambahProduk() {
    const n = document.getElementById("nama").value, 
          h = document.getElementById("harga").value, 
          s = document.getElementById("stok").value, 
          g = document.getElementById("gambar").value;
          
    if (!n || !h || !s) return alert("Lengkapi data!");
    
    let pList = getData("produk_clothing");
    pList.push({ 
        nama: n, 
        harga: parseInt(h), 
        stok: parseInt(s), 
        gambar: g || 'https://via.placeholder.com/150',
        hidden: false // Status default: Terlihat
    });
    
    saveData("produk_clothing", pList);
    renderInventory();
    ["nama", "harga", "stok", "gambar"].forEach(id => document.getElementById(id).value = "");
}

function renderInventory() {
    const tbody = document.getElementById("tabel-body");
    const data = getData("produk_clothing");
    
    tbody.innerHTML = data.map((p, i) => `
        <tr style="opacity: ${p.hidden ? '0.5' : '1'}; background: ${p.hidden ? 'rgba(255,255,255,0.02)' : 'transparent'}">
            <td>
                <div style="position:relative; width:40px; height:40px;">
                    <img src="${p.gambar}" width="40" height="40" style="border-radius:5px; object-fit:cover;">
                    ${p.hidden ? '<span style="position:absolute; top:-5px; right:-5px; font-size:10px; background:#ef4444; color:white; padding:1px 4px; border-radius:10px;">Hidden</span>' : ''}
                </div>
            </td>
            <td>${p.nama} ${p.hidden ? '<small>(Hidden)</small>' : ''}</td>
            <td>Rp ${p.harga.toLocaleString()}</td>
            <td style="color:${p.stok < 5 ? '#ef4444' : 'white'}; font-weight:bold">${p.stok}</td>
            <td>${p.hidden ? 'Non-Aktif' : (p.stok < 5 ? 'Menipis' : 'Aktif')}</td>
            <td>
                <div style="display:flex; gap:5px;">
                    <button onclick="openModal(${i})" style="color:#10b981; background:none; border:1px solid #10b981; cursor:pointer; border-radius:4px; padding:2px 5px;">Edit</button>
                    <button onclick="toggleHideProduk(${i})" style="color:${p.hidden ? '#3b82f6' : '#94a3b8'}; background:none; border:1px solid ${p.hidden ? '#3b82f6' : '#94a3b8'}; cursor:pointer; border-radius:4px; padding:2px 5px;">
                        ${p.hidden ? '👁️ Show' : '🚫 Hide'}
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

// FUNGSI BARU: TOGGLE HIDE/SHOW
function toggleHideProduk(index) {
    let pList = getData("produk_clothing");
    // Balikkan status hidden (jika true jadi false, jika false jadi true)
    pList[index].hidden = !pList[index].hidden;
    
    saveData("produk_clothing", pList);
    renderInventory();
}

// ================= MODAL LOGIC =================

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
    let pList = getData("produk_clothing");
    let i = document.getElementById("modal-index").value;
    pList[i].nama = document.getElementById("modal-nama").value;
    pList[i].harga = parseInt(document.getElementById("modal-harga").value);
    pList[i].stok = parseInt(document.getElementById("modal-stok").value);
    saveData("produk_clothing", pList);
    renderInventory();
    closeModal();
}

function hapusProdukDariModal() {
    let pList = getData("produk_clothing");
    let i = document.getElementById("modal-index").value;
    if (confirm(`Hapus produk "${pList[i].nama}" secara permanen?`)) {
        pList.splice(i, 1);
        saveData("produk_clothing", pList);
        closeModal();
        renderInventory();
        if (typeof renderOverview === "function") renderOverview();
    }
}

// ================= ORDERS, OVERVIEW & SALES (TETAP SAMA) =================
// (Bagian ini tidak berubah dari kode sebelumnya agar fitur lain tidak rusak)

function renderOrders() {
    const antrean = getData("antrean_pesanan");
    const rejected = getData("pesanan_reject");
    const approved = getData("laporan_penjualan");

    document.getElementById("tabel-order-approval").innerHTML = antrean.length === 0 ? '<tr><td colspan="4" style="text-align:center; opacity:0.5;">Tidak ada pesanan masuk</td></tr>' : 
    antrean.map((item, i) => `
        <tr>
            <td><small>${item.tanggal}</small></td>
            <td>${item.namaProduk}</td>
            <td>Rp ${item.hargaJual.toLocaleString()}</td>
            <td>
                <button onclick="showDetail(${i})" style="background:#3b82f6; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Detail</button>
                <button onclick="approveOrder(${i})" style="background:#10b981; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Approve</button>
                <button onclick="rejectOrder(${i})" style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Reject</button>
            </td>
        </tr>
    `).join("");

    document.getElementById("tabel-order-reject").innerHTML = rejected.length === 0 ? '<tr><td colspan="4" style="text-align:center; opacity:0.5;">Kosong</td></tr>' :
    rejected.map((item, i) => `
        <tr style="opacity:0.7">
            <td><small>${item.tanggal}</small></td>
            <td>${item.namaProduk}</td>
            <td><small>${item.alasan || 'N/A'}</small></td>
            <td><button onclick="removeReject(${i})" style="color:#ef4444; background:none; border:1px solid #ef4444; border-radius:4px; cursor:pointer; padding:2px 6px;">Remove</button></td>
        </tr>
    `).join("");

    document.getElementById("tabel-order-history-approve").innerHTML = approved.length === 0 ? '<tr><td colspan="4" style="text-align:center; opacity:0.5;">Belum ada pesanan selesai</td></tr>' :
    approved.slice(-10).reverse().map(item => `
        <tr style="background: rgba(16, 185, 129, 0.05)">
            <td><small>${item.tanggal}</small></td>
            <td>${item.namaProduk}</td>
            <td>Rp ${item.hargaJual.toLocaleString()}</td>
            <td style="color:#10b981; font-weight:bold;">BERHASIL</td>
        </tr>
    `).join("");
}

function showDetail(index) {
    const data = getData("antrean_pesanan")[index];
    document.getElementById("content-detail").innerHTML = `
        <p><strong>Nama Produk:</strong> ${data.namaProduk}</p>
        <p><strong>Harga:</strong> Rp ${data.hargaJual.toLocaleString()}</p>
        <p><strong>Tanggal:</strong> ${data.tanggal}</p>
        <p><strong>Status:</strong> Menunggu Persetujuan</p>
    `;
    document.getElementById("modal-detail").style.display = "flex";
}
function closeDetail() { document.getElementById("modal-detail").style.display = "none"; }

function approveOrder(index) {
    let antrean = getData("antrean_pesanan");
    let approved = getData("laporan_penjualan");
    let produk = getData("produk_clothing");
    let pIdx = produk.findIndex(p => p.nama === antrean[index].namaProduk);
    if(pIdx !== -1) { produk[pIdx].stok -= 1; saveData("produk_clothing", produk); }
    approved.push(antrean[index]);
    saveData("laporan_penjualan", approved);
    antrean.splice(index, 1);
    saveData("antrean_pesanan", antrean);
    renderOrders();
}

function rejectOrder(index) {
    let alasan = prompt("Alasan penolakan:");
    if (alasan === null) return;
    let antrean = getData("antrean_pesanan");
    let rejected = getData("pesanan_reject");
    let item = antrean[index];
    item.alasan = alasan || "Dibatalkan Admin";
    rejected.push(item);
    saveData("pesanan_reject", rejected);
    antrean.splice(index, 1);
    saveData("antrean_pesanan", antrean);
    renderOrders();
}

function removeReject(index) {
    if(confirm("Hapus history ini?")) {
        let rejected = getData("pesanan_reject");
        rejected.splice(index, 1);
        saveData("pesanan_reject", rejected);
        renderOrders();
    }
}

function renderOverview() {
    const sales = getData("laporan_penjualan");
    const produk = getData("produk_clothing");
    const pending = getData("antrean_pesanan");
    let views = {};
    try {
        const storedViews = localStorage.getItem("produk_views");
        views = storedViews ? JSON.parse(storedViews) : {};
    } catch (e) { views = {}; }
    const totalOmset = sales.reduce((a, b) => a + (Number(b.hargaJual) || 0), 0);
    document.getElementById("ov-total-omset").innerText = `Rp ${totalOmset.toLocaleString()}`;
    document.getElementById("ov-stok-low").innerText = produk.filter(p => p.stok < 5).length;
    document.getElementById("ov-pending").innerText = pending.length;
    const tbodyPopuler = document.getElementById("tabel-populer");
    if (tbodyPopuler) {
        let populerData = produk.map(p => ({
            nama: p.nama, harga: p.harga, gambar: p.gambar || 'https://via.placeholder.com/40', count: views[p.nama] || 0
        }));
        populerData.sort((a, b) => b.count - a.count);
        tbodyPopuler.innerHTML = populerData.slice(0, 5).map(p => `
            <tr>
                <td><img src="${p.gambar}" width="35" height="35" style="border-radius:5px; object-fit:cover;"></td>
                <td>${p.nama}</td>
                <td>Rp ${Number(p.harga).toLocaleString()}</td>
                <td><span style="background: rgba(245, 158, 11, 0.1); padding: 4px 10px; border-radius: 20px; color: #f59e0b; font-size: 12px; font-weight: bold;">${p.count} Views</span></td>
            </tr>
        `).join("");
    }
    const labels = []; const values = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const t = d.toLocaleDateString('id-ID');
        labels.push(t);
        const dailyTotal = sales.filter(s => s.tanggal && s.tanggal.startsWith(t)).reduce((a, b) => a + (Number(b.hargaJual) || 0), 0);
        values.push(dailyTotal);
    }
    if (typeof drawChart === "function") drawChart('salesChartOverview', labels, values, '#10b981');
}

function renderSalesPage() {
    const allSales = getData("laporan_penjualan");
    const tglMulai = document.getElementById("filter-mulai").value;
    const tglSelesai = document.getElementById("filter-selesai").value;
    let filtered = allSales;
    if (tglMulai && tglSelesai) {
        filtered = allSales.filter(s => {
            const [d, m, y] = s.tanggal.split(',')[0].split('/');
            const itemDate = new Date(`${y}-${m}-${d}`);
            return itemDate >= new Date(tglMulai) && itemDate <= new Date(tglSelesai);
        });
    }
    document.getElementById("sales-period-total").innerText = `Rp ${filtered.reduce((a, b) => a + b.hargaJual, 0).toLocaleString()}`;
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const history30 = allSales.filter(s => {
        const [d, m, y] = s.tanggal.split(',')[0].split('/');
        return new Date(`${y}-${m}-${d}`) >= thirtyDaysAgo;
    });
    document.getElementById("total-omset-30hari").innerText = `Rp ${history30.reduce((a, b) => a + b.hargaJual, 0).toLocaleString()}`;
    document.getElementById("tabel-history-30hari").innerHTML = history30.reverse().map(s => `
        <tr><td>${s.tanggal}</td><td>${s.namaProduk}</td><td>Rp ${s.hargaJual.toLocaleString()}</td><td>Selesai</td></tr>
    `).join("");
    const group = filtered.reduce((acc, curr) => {
        const tgl = curr.tanggal.split(',')[0];
        acc[tgl] = (acc[tgl] || 0) + curr.hargaJual;
        return acc;
    }, {});
    drawChart('detailedSalesChart', Object.keys(group), Object.values(group), '#3b82f6');
}

function drawChart(id, labels, data, color) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: [{ data, borderColor: color, backgroundColor: color + '22', fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function logout() { if(confirm("Keluar?")) window.location.href = "login.html"; }
window.onload = () => changePage('overview');