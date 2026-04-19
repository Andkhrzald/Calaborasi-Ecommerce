const getData = (key) => JSON.parse(localStorage.getItem(key)) || [];
const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

let charts = {};

// --- FORMATTING: List Menurun & Bersihkan Teks ---
function formatProductQty(rawString) {
    if (!rawString) return "";
    let clean = rawString.replace(/\(\d+\sproduk\)/gi, "").replace(/\(x\d+\)/gi, "").replace(/\sx\d+/gi, "").trim();
    const match = rawString.match(/x(\d+)/i);
    const qty = match ? match[1] : "1";

    if (clean.includes(",")) {
        return clean.split(",").map(item => {
            let itemClean = item.trim().replace(/\(x\d+\)/gi, "").replace(/x\d+/gi, "").trim();
            let itemMatch = item.match(/x(\d+)/i);
            let itemQty = itemMatch ? itemMatch[1] : qty;
            return `<div class="product-item-list">• ${itemClean} <b>(${itemQty} produk)</b></div>`;
        }).join("");
    }
    return `<div class="product-item-list">• ${clean} <b>(${qty} produk)</b></div>`;
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
            <td><div class="img-container"><img src="img/${p.gambar}" onerror="this.src='https://placehold.co/50x50?text=Error'"></div></td>
            <td>${p.nama}</td>
            <td><b>${p.stok}</b></td>
            <td><span style="color:${sCol}; font-size:11px; font-weight:bold;">${sTxt}</span></td>
        </tr>`;
    }).join("");
}

// --- INVENTORY ---
function renderInventory() {
    const data = getData("produk_clothing");
    document.getElementById("tabel-body").innerHTML = data.map((p, i) => {
        const isLow = Number(p.stok) < 5;
        const sCol = isLow ? "#f59e0b" : "#10b981";
        return `<tr style="opacity: ${p.hidden ? '0.5' : '1'}">
            <td><div class="img-container"><img src="img/${p.gambar}" onerror="this.src='https://placehold.co/50x50?text=Error'"></div></td>
            <td>${p.nama}</td>
            <td>Rp ${Number(p.harga).toLocaleString()}</td>
            <td><b>${p.stok}</b></td>
            <td><span style="color:${p.hidden ? '#94a3b8' : sCol}; font-weight:bold;">${p.hidden ? 'Hidden' : (isLow ? 'Stok Menipis' : 'Aman')}</span></td>
            <td>
                <button onclick="openModal(${i})" style="border:1px solid #3b82f6; color:#3b82f6; background:none; padding:4px 8px; cursor:pointer;">Edit</button>
                <button onclick="toggleHide(${i})" style="border:1px solid #94a3b8; color:#94a3b8; background:none; padding:4px 8px; cursor:pointer;">${p.hidden ? 'Show' : 'Hide'}</button>
            </td>
        </tr>`;
    }).join("");
}

function tambahProduk() {
    const n = document.getElementById("nama").value, h = document.getElementById("harga").value, s = document.getElementById("stok").value, g = document.getElementById("gambar").value;
    if(!n || !h || !s) return alert("Lengkapi data!");
    let list = getData("produk_clothing");
    list.push({ nama: n, harga: Number(h), stok: Number(s), gambar: g, hidden: false });
    saveData("produk_clothing", list);
    renderInventory();
    ["nama", "harga", "stok", "gambar"].forEach(id => document.getElementById(id).value = "");
}

// --- ORDERS & STOK SYNC ---
function renderOrders() {
    const antrean = getData("antrean_pesanan");
    const app = getData("laporan_penjualan");

    document.getElementById("tabel-order-approval").innerHTML = antrean.map((item, i) => `
        <tr>
            <td><small>${item.tanggal}</small></td>
            <td>${formatProductQty(item.namaProduk)}</td>
            <td>Rp ${Number(item.hargaJual).toLocaleString()}</td>
            <td>
                <button onclick="approveOrder(${i})" style="background:#10b981; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Approve</button>
            </td>
        </tr>`).join("");

    document.getElementById("tabel-order-history-approve").innerHTML = [...app].reverse().slice(0, 10).map((item) => `
        <tr>
            <td><small>${item.tanggal}</small></td>
            <td>${formatProductQty(item.namaProduk)}</td>
            <td>Rp ${Number(item.hargaJual).toLocaleString()}</td>
            <td>✅ Selesai</td>
        </tr>`).join("");
}

function approveOrder(i) {
    let antrean = getData("antrean_pesanan"), app = getData("laporan_penjualan"), prod = getData("produk_clothing");
    const item = antrean[i];
    
    // Potong stok otomatis
    item.namaProduk.split(",").forEach(sub => {
        let name = sub.replace(/\(x\d+\)/gi, "").replace(/x\d+/gi, "").trim();
        let qMatch = sub.match(/x(\d+)/i);
        let qty = qMatch ? parseInt(qMatch[1]) : 1;
        let pIdx = prod.findIndex(p => p.nama === name);
        if(pIdx !== -1) prod[pIdx].stok = Math.max(0, Number(prod[pIdx].stok) - qty);
    });
    
    saveData("produk_clothing", prod);
    app.push(item); saveData("laporan_penjualan", app);
    antrean.splice(i, 1); saveData("antrean_pesanan", antrean);
    renderOrders(); renderOverview();
}

// --- UTILS ---
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
function toggleHide(i) {
    let list = getData("produk_clothing"); list[i].hidden = !list[i].hidden;
    saveData("produk_clothing", list); renderInventory();
}
function logout() { if(confirm("Logout?")) window.location.href = "login.html"; }

window.onload = () => changePage('overview');