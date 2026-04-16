// ==========================================
// 1. DATABASE ACCESS (LOCAL STORAGE)
// ==========================================
const getData = (key) => {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
        console.error("Gagal ambil data:", key);
        return [];
    }
};

const saveData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

let charts = {}; 

// ==========================================
// 2. SISTEM TRACKING VIEW (PRODUK TERPOPULER)
// ==========================================
function recordProductView(namaProduk) {
    let views = JSON.parse(localStorage.getItem("produk_views")) || {};
    views[namaProduk] = (views[namaProduk] || 0) + 1;
    localStorage.setItem("produk_views", JSON.stringify(views));
}

// ==========================================
// 3. NAVIGASI HALAMAN
// ==========================================
function changePage(pageName) {
    document.querySelectorAll('.content-page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));

    const activePage = document.getElementById('page-' + pageName);
    if (activePage) activePage.style.display = 'block';

    const activeMenu = document.getElementById('menu-' + pageName);
    if (activeMenu) activeMenu.classList.add('active');

    if (pageName === 'overview') renderOverview();
    if (pageName === 'inventory') renderInventory();
    if (pageName === 'orders') renderOrders();
    if (pageName === 'sales') renderSalesPage();
}

// ==========================================
// 4. INVENTORY LOGIC
// ==========================================
function tambahProduk() {
    const n = document.getElementById("nama").value,
          h = document.getElementById("harga").value,
          s = document.getElementById("stok").value,
          g = document.getElementById("gambar").value;

    if (!n || !h || !s) return alert("Data wajib diisi!");

    let pList = getData("produk_clothing");
    pList.push({
        id: Date.now(),
        nama: n,
        harga: parseInt(h),
        stok: parseInt(s),
        gambar: g || 'https://via.placeholder.com/150'
    });

    saveData("produk_clothing", pList);
    renderInventory();
    ["nama", "harga", "stok", "gambar"].forEach(id => document.getElementById(id).value = "");
    alert("Produk Berhasil Masuk!");
}

function renderInventory() {
    const tbody = document.getElementById("tabel-body");
    const data = getData("produk_clothing");
    if(!tbody) return;

    tbody.innerHTML = data.map((p, i) => `
        <tr>
            <td><img src="${p.gambar}" width="40" height="40" style="border-radius:5px; object-fit:cover;"></td>
            <td>${p.nama}</td>
            <td>Rp ${p.harga.toLocaleString()}</td>
            <td>${p.stok}</td>
            <td><button onclick="openModal(${i})" style="color:#10b981; cursor:pointer; background:none; border:1px solid #10b981; padding:5px 10px; border-radius:5px;">Edit/View</button></td>
        </tr>
    `).join("");
}

// ==========================================
// 5. ORDER LOGIC (ANTREAN, APPROVED, REJECTED)
// ==========================================
function renderOrders() {
    const antrean = getData("antrean_pesanan");
    const rejected = getData("reject_history");
    const approved = getData("laporan_penjualan");
    
    const tbodyApproval = document.getElementById("tabel-order-approval");
    const tbodyReject = document.getElementById("tabel-order-reject-history");
    const tbodyApproved = document.getElementById("tabel-order-approved-history");

    // 1. Antrean
    if(tbodyApproval) {
        tbodyApproval.innerHTML = antrean.map((item, index) => `
            <tr>
                <td><small>${item.tanggal}</small></td>
                <td><strong>${item.namaProduk}</strong></td>
                <td>Rp ${item.hargaJual.toLocaleString()}</td>
                <td>
                    <div style="display:flex; gap:5px;">
                        <button onclick="showDetail(${index})" style="background:#3b82f6; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;">Detail</button>
                        <button onclick="approveOrder(${index})" style="background:#10b981; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;">Approve</button>
                        <button onclick="rejectOrder(${index})" style="background:#ef4444; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;">Reject</button>
                    </div>
                </td>
            </tr>
        `).join("");
    }

    // 2. Approved History
    if(tbodyApproved) {
        tbodyApproved.innerHTML = approved.map((item) => `
            <tr style="background: rgba(16, 185, 129, 0.02);">
                <td><small>${item.tanggal}</small></td>
                <td>${item.namaProduk}</td>
                <td>Rp ${item.hargaJual.toLocaleString()}</td>
                <td><span style="color:#10b981; font-weight:bold;">Selesai</span></td>
            </tr>
        `).reverse().slice(0, 10).join("");
    }

    // 3. Reject History
    if(tbodyReject) {
        tbodyReject.innerHTML = rejected.map((item, index) => `
            <tr style="opacity: 0.6; background: rgba(239, 68, 68, 0.02);">
                <td><small>${item.tanggal}</small></td>
                <td><del>${item.namaProduk}</del></td>
                <td>Rp ${item.hargaJual.toLocaleString()}</td>
                <td>
                    <button onclick="removeRejectHistory(${index})" style="background:transparent; color:#ef4444; border:1px solid #ef4444; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px;">Remove</button>
                </td>
            </tr>
        `).join("");
    }
}

function approveOrder(index) {
    let antrean = getData("antrean_pesanan");
    let penghasilan = getData("laporan_penjualan");
    penghasilan.push(antrean[index]);
    saveData("laporan_penjualan", penghasilan);
    antrean.splice(index, 1);
    saveData("antrean_pesanan", antrean);
    renderOrders();
    alert("Pesanan Disetujui!");
}

function rejectOrder(index) {
    if (confirm("Tolak pesanan ini?")) {
        let antrean = getData("antrean_pesanan");
        let rejectHistory = getData("reject_history");
        rejectHistory.push(antrean[index]);
        saveData("reject_history", rejectHistory);
        antrean.splice(index, 1);
        saveData("antrean_pesanan", antrean);
        renderOrders();
    }
}

function removeRejectHistory(index) {
    if (confirm("Hapus permanen?")) {
        let rejectHistory = getData("reject_history");
        rejectHistory.splice(index, 1);
        saveData("reject_history", rejectHistory);
        renderOrders();
    }
}

// ==========================================
// 6. OVERVIEW & ANALYTICS
// ==========================================
function renderOverview() {
    const sales = getData("laporan_penjualan");
    const produk = getData("produk_clothing");
    const orders = getData("antrean_pesanan");
    const views = JSON.parse(localStorage.getItem("produk_views")) || {};

    const omsetElem = document.getElementById("ov-total-omset");
    if(omsetElem) omsetElem.innerText = `Rp ${sales.reduce((a, b) => a + (b.hargaJual || 0), 0).toLocaleString()}`;
    
    const stokElem = document.getElementById("ov-stok-low");
    if(stokElem) stokElem.innerText = produk.filter(p => p.stok < 5).length;
    
    const pendingElem = document.getElementById("ov-pending");
    if(pendingElem) pendingElem.innerText = orders.length;

    const tbodyPopuler = document.getElementById("tabel-populer");
    if(tbodyPopuler) {
        let sortedPopuler = produk.map(p => ({
            nama: p.nama,
            gambar: p.gambar,
            viewCount: views[p.nama] || 0
        })).sort((a, b) => b.viewCount - a.viewCount);

        tbodyPopuler.innerHTML = sortedPopuler.slice(0, 5).map(p => `
            <tr>
                <td><img src="${p.gambar}" width="35" height="35" style="border-radius:5px; object-fit:cover;"></td>
                <td>${p.nama}</td>
                <td><span style="background:#1e293b; padding:2px 8px; border-radius:10px; color:#10b981; font-size:12px;">${p.viewCount} Views</span></td>
            </tr>
        `).join("");
    }

    const labels = []; const values = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const t = d.toLocaleDateString('id-ID');
        labels.push(t);
        const total = sales.filter(s => s.tanggal && s.tanggal.startsWith(t)).reduce((a, b) => a + (b.hargaJual || 0), 0);
        values.push(total);
    }
    renderChart('salesChartOverview', 'line', labels, values, '#10b981');
}

function renderSalesPage() {
    const allSales = getData("laporan_penjualan");
    const totalElem = document.getElementById("sales-period-total");
    if(totalElem) totalElem.innerText = `Rp ${allSales.reduce((a, b) => a + (b.hargaJual || 0), 0).toLocaleString()}`;

    const tbodySales = document.getElementById("tabel-terjual");
    if(tbodySales) {
        tbodySales.innerHTML = allSales.map(s => `
            <tr><td>${s.tanggal}</td><td>${s.namaProduk}</td><td>Rp ${s.hargaJual.toLocaleString()}</td><td>Selesai</td></tr>
        `).reverse().join("");
    }
}

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

// ==========================================
// 7. UI HELPERS & MODAL
// ==========================================
function openModal(i) {
    const p = getData("produk_clothing")[i];
    recordProductView(p.nama);
    document.getElementById("modal-nama").value = p.nama;
    document.getElementById("modal-harga").value = p.harga;
    document.getElementById("modal-stok").value = p.stok;
    document.getElementById("modal-gambar").value = p.gambar;
    document.getElementById("modal-index").value = i;
    document.getElementById("modal-edit").style.display = "flex";
}

function showDetail(index) {
    const item = getData("antrean_pesanan")[index];
    const content = document.getElementById("detail-content");
    if (item && item.customer) {
        content.innerHTML = `<p><strong>Nama:</strong> ${item.customer.nama}</p><p><strong>WA:</strong> ${item.customer.telp}</p><p><strong>Alamat:</strong> ${item.customer.alamat}</p>`;
    }
    document.getElementById("modal-detail").style.display = "flex";
}

function closeModal() {
    document.getElementById("modal-edit").style.display = "none";
    document.getElementById("modal-detail").style.display = "none";
}

function logout() {
    window.location.href = "login.html";
}

// ==========================================
// 8. INITIAL LOAD
// ==========================================
window.onload = () => {
    changePage('overview');
};