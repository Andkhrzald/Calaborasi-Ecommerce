// --- 1. CONFIG & AUTH ---
const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
if (!user) window.location.href = "login.html";

document.getElementById("user-display").innerText = user.username;
document.getElementById("role-display").innerText = "Jabatan: " + user.role;

const getProduk = () => JSON.parse(localStorage.getItem("produk_clothing")) || [];

// --- 2. NAVIGASI ---
function changePage(pageName) {
    document.querySelectorAll('.content-page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.menu-item').forEach(m => m.style.background = 'transparent');
    document.getElementById('page-' + pageName).style.display = 'block';
    
    if (pageName === 'inventory') renderInventory();
    if (pageName === 'orders') renderOrders();
    if (pageName === 'sales') renderPenjualan();
}

// --- 3. INVENTORY LOGIC ---
function renderInventory() {
    const tbody = document.getElementById("tabel-body");
    tbody.innerHTML = getProduk().map((p, i) => `
        <tr>
            <td><img src="../assets/img/${p.gambar}" width="40" height="40" style="object-fit:cover;"></td>
            <td>${p.nama}</td>
            <td>Rp ${parseInt(p.harga).toLocaleString()}</td>
            <td>${p.stok} Pcs</td>
            <td><button onclick="openModal(${i})">⚙️ Edit</button></td>
        </tr>
    `).join("");
}

function openModal(i) {
    const p = getProduk()[i];
    document.getElementById("modal-nama").value = p.nama;
    document.getElementById("modal-harga").value = p.harga;
    document.getElementById("modal-stok").value = p.stok;
    document.getElementById("modal-gambar").value = p.gambar;
    document.getElementById("modal-index").value = i;
    document.getElementById("modal-edit").style.display = "flex";
}

function closeModal() { document.getElementById("modal-edit").style.display = "none"; }

function tambahProduk() {
    const n = document.getElementById("nama").value, h = document.getElementById("harga").value, s = document.getElementById("stok").value, g = document.getElementById("gambar").value;
    if (n && h && s && g) {
        let data = getProduk();
        data.push({ id: Date.now(), nama: n, harga: parseInt(h), stok: parseInt(s), gambar: g });
        localStorage.setItem("produk_clothing", JSON.stringify(data));
        renderInventory();
        alert("Produk Berhasil Disimpan!");
    }
}

// --- 4. ORDER LOGIC (FIXED) ---
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
}

function rejectOrder(index) {
    let antrean = JSON.parse(localStorage.getItem("antrean_pesanan")) || [];
    antrean.splice(index, 1);
    localStorage.setItem("antrean_pesanan", JSON.stringify(antrean));
    renderOrders();
}

function renderPenjualan() {
    const sales = JSON.parse(localStorage.getItem("laporan_penjualan")) || [];
    let total = 0;
    document.getElementById("tabel-penjualan").innerHTML = sales.map(s => {
        total += s.hargaJual;
        return `<tr><td>${s.tanggal}</td><td>${s.namaProduk}</td><td>Rp ${s.hargaJual.toLocaleString()}</td></tr>`;
    }).join("");
    document.getElementById("total-duit").innerText = "Rp " + total.toLocaleString();
}

function logout() { sessionStorage.clear(); window.location.href = "login.html"; }

// Init
changePage('inventory');