const getData = (key) => JSON.parse(localStorage.getItem(key)) || [];
const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

let charts = {};

// --- NAVIGATION ---
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
            <td><img src="../img/" width="35" height="35" style="border-radius:6px; object-fit:cover;"></td>
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
            <td><img src="../img/${p.gambar}" width="40" height="40" style="object-fit:cover; border-radius:8px;"></td>
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

window.onload = () => changePage('overview');