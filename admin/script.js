const getData = (key) => JSON.parse(localStorage.getItem(key)) || [];
const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

let charts = {};

// --- FIX LOGIC: MENGHINDARI DOUBLE TEXT ---
function formatProductQty(rawString) {
    if (!rawString) return "";

    // Step 1: Bersihkan semua format lama
    let clean = rawString
        .replace(/\(\d+\sproduk\)/gi, "")
        .replace(/\(x\d+\)/gi, "")
        .replace(/\sx\d+/gi, "")
        .trim();

    // Step 2: Ambil angka qty global jika bukan multiple items
    const match = rawString.match(/x(\d+)/i);
    const qty = match ? match[1] : "1";

    // Step 3: Jika beli banyak produk (ada koma), kita pecah jadi baris-baris (menurun)
    if (clean.includes(",")) {
        return clean.split(",").map(item => {
            let itemClean = item.trim().replace(/\(x\d+\)/gi, "").replace(/x\d+/gi, "").trim();
            let itemMatch = item.match(/x(\d+)/i);
            let itemQty = itemMatch ? itemMatch[1] : qty;
            
            // Kita bungkus dengan div agar rapi dan menurun
            return `<div style="margin-bottom: 4px; border-bottom: 1px dashed #334155; padding-bottom: 2px;">
                        • ${itemClean} <b>(${itemQty} produk)</b>
                    </div>`;
        }).join("");
    }

    // Jika cuma 1 jenis produk
    return `<div>• ${clean} <b>(${qty} produk)</b></div>`;
}
// Untuk keperluan potong stok
function getPureName(name) {
    return name.split(",")[0].replace(/\(x\d+\)/gi, "").replace(/x\d+/gi, "").replace(/\(\d+\sproduk\)/gi, "").trim();
}

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

    document.getElementById("ov-total-omset").innerText = `Rp ${sales.reduce((a, b) => a + (Number(b.hargaJual) || 0), 0).toLocaleString()}`;
    document.getElementById("ov-stok-low").innerText = produk.filter(p => Number(p.stok) < 5).length;
    document.getElementById("ov-pending").innerText = pending.length;

    const sorted = [...produk].sort((a, b) => Number(a.stok) - Number(b.stok)).slice(0, 5);
    document.getElementById("tabel-populer").innerHTML = sorted.map(p => {
        const isLow = Number(p.stok) < 5;
        const sTxt = isLow ? "Menipis ⚠️" : "Aman ✅";
        const sCol = isLow ? "#f59e0b" : "#10b981";
        return `<tr>
            <td><img src="${p.gambar}" width="35" height="35" style="border-radius:6px; object-fit:cover;"></td>
            <td>${p.nama}</td>
            <td>Rp ${Number(p.harga).toLocaleString()}</td>
            <td><b>${p.stok}</b></td>
            <td><span style="color:${sCol}; font-size:11px; font-weight:bold; background:${sCol}11; padding:3px 6px; border-radius:4px; border:1px solid ${sCol}33;">${sTxt}</span></td>
        </tr>`;
    }).join("");
    updateMainChart(sales);
}

// --- INVENTORY ---
function renderInventory() {
    const data = getData("produk_clothing");
    document.getElementById("tabel-body").innerHTML = data.map((p, i) => {
        const isLow = Number(p.stok) < 5;
        const sCol = isLow ? "#f59e0b" : "#10b981";
        return `<tr style="opacity: ${p.hidden ? '0.5' : '1'}">
            <td><img src="${p.gambar}" width="40" height="40" style="object-fit:cover; border-radius:8px;"></td>
            <td>${p.nama}</td>
            <td>Rp ${Number(p.harga).toLocaleString()}</td>
            <td><b>${p.stok}</b></td>
            <td><span style="color:${p.hidden ? '#94a3b8' : sCol}; font-size:12px; font-weight:bold;">${p.hidden ? 'Hidden 🚫' : (isLow ? 'Stok Menipis ⚠️' : 'Aman ✅')}</span></td>
            <td>
                <button onclick="openModal(${i})" style="border:1px solid #3b82f6; color:#3b82f6; background:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Edit</button>
                <button onclick="toggleHide(${i})" style="border:1px solid #94a3b8; color:#94a3b8; background:none; padding:4px 8px; border-radius:4px; cursor:pointer;">${p.hidden ? 'Show' : 'Hide'}</button>
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

// --- ORDERS ---
function renderOrders() {
    const antrean = getData("antrean_pesanan");
    const rej = getData("pesanan_reject");
    const app = getData("laporan_penjualan");

    document.getElementById("tabel-order-approval").innerHTML = antrean.map((item, i) => `
        <tr>
            <td><small>${item.tanggal}</small></td>
            <td>${formatProductQty(item.namaProduk)}</td>
            <td>Rp ${Number(item.hargaJual).toLocaleString()}</td>
            <td>
                <button onclick="showDetail(${i})" style="background:#3b82f6; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;">Detail</button>
                <button onclick="approveOrder(${i})" style="background:#10b981; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;">Approve</button>
                <button onclick="rejectOrder(${i})" style="background:#ef4444; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;">Reject</button>
            </td>
        </tr>`).join("");

    document.getElementById("tabel-order-reject").innerHTML = [...rej].reverse().map((item) => `
        <tr><td><small>${item.tanggal}</small></td><td>${formatProductQty(item.namaProduk)}</td><td style="color:#ef4444; font-size:11px;"><i>${item.alasan}</i></td></tr>
    `).join("");

    document.getElementById("tabel-order-history-approve").innerHTML = [...app].reverse().slice(0, 10).map((item) => {
        const idx = app.findIndex(x => x === item);
        return `<tr>
            <td><small>${item.tanggal}</small></td>
            <td>${formatProductQty(item.namaProduk)}</td>
            <td>Rp ${Number(item.hargaJual).toLocaleString()}</td>
            <td><button onclick="printStruk(${idx})" style="background:#6366f1; color:white; border:none; padding:4px 10px; border-radius:4px; cursor:pointer;">Nota 🖨️</button></td>
        </tr>`;
    }).join("");
}

function approveOrder(i) {
    let antrean = getData("antrean_pesanan"), app = getData("laporan_penjualan"), prod = getData("produk_clothing");
    const item = antrean[i];
    
    // Proses potong stok jika item ada di inventory
    if (item.namaProduk.includes(",")) {
        item.namaProduk.split(",").forEach(sub => {
            let murni = sub.replace(/\(x\d+\)/gi, "").replace(/x\d+/gi, "").trim();
            let qMatch = sub.match(/x(\d+)/i);
            let qty = qMatch ? parseInt(qMatch[1]) : 1;
            let pIdx = prod.findIndex(p => p.nama === murni);
            if(pIdx !== -1) prod[pIdx].stok = Math.max(0, Number(prod[pIdx].stok) - qty);
        });
    } else {
        let murni = getPureName(item.namaProduk);
        let qMatch = item.namaProduk.match(/x(\d+)/i);
        let qty = qMatch ? parseInt(qMatch[1]) : 1;
        let pIdx = prod.findIndex(p => p.nama === murni);
        if(pIdx !== -1) prod[pIdx].stok = Math.max(0, Number(prod[pIdx].stok) - qty);
    }
    
    saveData("produk_clothing", prod);
    app.push(item); saveData("laporan_penjualan", app);
    antrean.splice(i, 1); saveData("antrean_pesanan", antrean);
    renderOrders(); renderOverview();
}

function rejectOrder(i) {
    const al = prompt("Alasan Penolakan:");
    if(al === null) return;
    let antrean = getData("antrean_pesanan"), rej = getData("pesanan_reject");
    let item = antrean[i]; 
    item.alasan = al || "Dibatalkan Admin";
    rej.push(item); saveData("pesanan_reject", rej);
    antrean.splice(i, 1); saveData("antrean_pesanan", antrean);
    renderOrders();
}

// --- SALES PAGE ---
function renderSalesPage() {
    const sales = getData("laporan_penjualan");
    document.getElementById("sales-period-total").innerText = `Rp ${sales.reduce((a, b) => a + (Number(b.hargaJual) || 0), 0).toLocaleString()}`;
    document.getElementById("tabel-history-30hari").innerHTML = [...sales].reverse().map(s => `
        <tr><td>${s.tanggal}</td><td>${formatProductQty(s.namaProduk)}</td><td>Rp ${Number(s.hargaJual).toLocaleString()}</td><td><b style="color:#10b981">Sukses</b></td></tr>
    `).join("");

    const labels = sales.map(s => s.tanggal.split(',')[0]).slice(-7);
    const values = sales.map(s => s.hargaJual).slice(-7);
    drawChart('detailedSalesChart', labels, values, '#10b981');
}

// --- PRINT ---
function printStruk(i) {
    const d = getData("laporan_penjualan")[i];
    const win = window.open('', '', 'width=450,height=600');
    const css = `<style>body{font-family:'Courier New',monospace;padding:25px;color:#333;}.box{width:100%;max-width:280px;margin:auto;border:1px solid #eee;padding:15px;}.h{text-align:center;border-bottom:2px dashed #333;padding-bottom:10px;margin-bottom:15px;}.row{display:flex;justify-content:space-between;margin-bottom:5px;font-size:14px;}.f{text-align:center;border-top:2px dashed #333;padding-top:10px;margin-top:20px;font-size:12px;}</style>`;
    const html = `<div class="box"><div class="h"><h2>ELVOO</h2><small>EXECUTIVE CLOTHING</small></div><div class="row"><span>Tanggal:</span><span>${d.tanggal}</span></div><div class="row"><span>ID:</span><span>#EV-${Math.floor(Math.random()*1000)}</span></div><hr><div class="row" style="flex-direction:column; align-items:flex-start;"><b>PRODUK:</b><div style="font-size:12px;">${formatProductQty(d.namaProduk)}</div></div><div class="row" style="margin-top:15px; font-size:18px;"><b>TOTAL</b><b>Rp ${Number(d.hargaJual).toLocaleString()}</b></div><div class="f"><p>Thank you for your purchase!</p><p>WWW.ELVOO.COM</p></div></div>`;
    win.document.write(`<html><head>${css}</head><body>${html}<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();}}</script></body></html>`);
    win.document.close();
}

// --- CHARTS & MODALS ---
function drawChart(id, labels, data, color) {
    const canvas = document.getElementById(id); if (!canvas) return;
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
    document.getElementById("content-detail").innerHTML = `<p><b>Produk:</b><br>${formatProductQty(d.namaProduk)}</p><p><b>Alamat:</b><br>${d.alamat || '-'}</p><p><b>Catatan:</b><br>${d.catatan || '-'}</p>`;
    document.getElementById("modal-detail").style.display = "flex";
}
function closeDetail() { document.getElementById("modal-detail").style.display = "none"; }
function toggleHide(i) {
    let list = getData("produk_clothing"); list[i].hidden = !list[i].hidden;
    saveData("produk_clothing", list); renderInventory();
}
function logout() { if(confirm("Logout?")) window.location.href = "login.html"; }

window.onload = () => changePage('overview');