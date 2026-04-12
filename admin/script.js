// --- 1. PROTEKSI & DATA AWAL ---
const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
if (!user) window.location.href = "login.html";

document.getElementById("user-display").innerText = user.username;
document.getElementById("role-display").innerText = "Jabatan: " + user.role;

function getProduk() {
    return JSON.parse(localStorage.getItem("produk_clothing")) || [];
}

// --- 2. SISTEM NAVIGASI ---
function changePage(pageName) {
    const allPages = document.querySelectorAll('.content-page');
    allPages.forEach(p => p.style.display = 'none');

    const allMenus = document.querySelectorAll('.menu-item');
    allMenus.forEach(m => m.style.background = 'transparent');

    document.getElementById('page-' + pageName).style.display = 'block';

    const menuMap = { 
        'inventory': 'menu-inv', 
        'sales': 'menu-sales', 
        'website': 'menu-web', 
        'orders': 'menu-orders' 
    };
    if(menuMap[pageName]) {
        document.getElementById(menuMap[pageName]).style.background = '#333';
    }

    if (pageName === 'inventory') renderInventory();
    if (pageName === 'sales') renderPenjualan();
    if (pageName === 'website') loadBannerPreview();
    if (pageName === 'orders') renderOrders();
}

// --- 3. FITUR INVENTORY & MODAL ---
function renderInventory() {
    const tbody = document.getElementById("tabel-body");
    const dataProduk = getProduk();

    tbody.innerHTML = dataProduk.map((p, index) => `
        <tr>
            <td>
                <img src="../assets/img/${p.gambar}" width="50" height="50" style="object-fit:cover; border-radius:4px;" onerror="this.src='https://via.placeholder.com/50'">
            </td>
            <td><strong>${p.nama}</strong></td>
            <td>Rp ${parseInt(p.harga).toLocaleString()}</td>
            <td>${p.stok} Pcs</td>
            <td>
                <button onclick="openModal(${index})" class="btn-edit-trigger">⚙️ Edit</button>
            </td>
        </tr>
    `).join("");

    if (user.role === "Warehouse") {
        const inputArea = document.getElementById("input-area");
        if(inputArea) inputArea.style.display = "none";
    }
}

// FUNGSI MODAL
function openModal(index) {
    const dataProduk = getProduk();
    const p = dataProduk[index];

    document.getElementById("modal-nama").value = p.nama;
    document.getElementById("modal-harga").value = p.harga;
    document.getElementById("modal-stok").value = p.stok;
    document.getElementById("modal-gambar").value = p.gambar;
    document.getElementById("modal-index").value = index;

    document.getElementById("modal-edit").style.display = "block";
}

function closeModal() {
    document.getElementById("modal-edit").style.display = "none";
}

function simpanPerubahanModal() {
    let dataProduk = getProduk();
    const index = document.getElementById("modal-index").value;

    dataProduk[index].nama = document.getElementById("modal-nama").value;
    dataProduk[index].harga = document.getElementById("modal-harga").value;
    dataProduk[index].stok = parseInt(document.getElementById("modal-stok").value);
    dataProduk[index].gambar = document.getElementById("modal-gambar").value;

    localStorage.setItem("produk_clothing", JSON.stringify(dataProduk));
    alert("Data Berhasil Diperbarui!");
    closeModal();
    renderInventory();
}

function hapusProdukModal() {
    if (confirm("Hapus produk ini?")) {
        let dataProduk = getProduk();
        const index = document.getElementById("modal-index").value;
        dataProduk.splice(index, 1);
        localStorage.setItem("produk_clothing", JSON.stringify(dataProduk));
        closeModal();
        renderInventory();
    }
}

function tambahProduk() {
    const n = document.getElementById("nama").value;
    const h = document.getElementById("harga").value;
    const s = parseInt(document.getElementById("stok").value);
    const g = document.getElementById("gambar").value;

    if (n && h && s && g) {
        let dataProduk = JSON.parse(localStorage.getItem("produk_clothing")) || [];
        
        // Buat objek produk baru
        const produkBaru = { 
            id: Date.now(), // ID Unik untuk hapus/edit
            nama: n, 
            harga: parseInt(h), 
            stok: s, 
            gambar: g, 
            creator: user.username 
        };

        dataProduk.push(produkBaru);
        
        // SIMPAN KE LOCALSTORAGE
        localStorage.setItem("produk_clothing", JSON.stringify(dataProduk));
        
        alert("Produk Berhasil Muncul di Web Customer!");
        
        renderInventory();
        
        // Reset Form
        document.getElementById("nama").value = "";
        document.getElementById("harga").value = "";
        document.getElementById("stok").value = "";
        document.getElementById("gambar").value = "";
    } else {
        alert("Gagal: Semua data (Nama, Harga, Stok, Gambar) wajib diisi!");
    }
}

// --- 4. FITUR ORDER APPROVAL ---
function renderOrders() {
    const antrean = JSON.parse(localStorage.getItem("antrean_pesanan")) || [];
    const tbody = document.getElementById("tabel-order-approval");
    
    if (antrean.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px;">Tidak ada pesanan masuk.</td></tr>`;
        return;
    }

    tbody.innerHTML = antrean.map((item, index) => `
        <tr>
            <td>${item.tanggal}</td>
            <td>${item.namaProduk}</td>
            <td>Rp ${item.hargaJual.toLocaleString()}</td>
            <td>
                <button onclick="approveOrder(${index})" class="btn-approve">Approve</button>
                <button onclick="rejectOrder(${index})" class="btn-reject">Reject</button>
            </td>
        </tr>
    `).join("");
}

function approveOrder(index) {
    let antrean = JSON.parse(localStorage.getItem("antrean_pesanan")) || [];
    let penghasilan = JSON.parse(localStorage.getItem("laporan_penjualan")) || [];
    let dataProduk = getProduk();
    
    const order = antrean[index];
    const productName = order.namaProduk.split(" (x")[0]; 
    const pIdx = dataProduk.findIndex(p => p.nama === productName);

    if (pIdx !== -1) {
        if (dataProduk[pIdx].stok > 0) {
            dataProduk[pIdx].stok -= 1;
            localStorage.setItem("produk_clothing", JSON.stringify(dataProduk));
        } else {
            alert("Gagal Approve: Stok habis!");
            return;
        }
    }

    penghasilan.push(order);
    localStorage.setItem("laporan_penjualan", JSON.stringify(penghasilan));
    antrean.splice(index, 1);
    localStorage.setItem("antrean_pesanan", JSON.stringify(antrean));
    alert("Pesanan Disetujui!");
    renderOrders();
}

function rejectOrder(index) {
    if (confirm("Yakin ingin menolak pesanan ini?")) {
        let antrean = JSON.parse(localStorage.getItem("antrean_pesanan")) || [];
        antrean.splice(index, 1);
        localStorage.setItem("antrean_pesanan", JSON.stringify(antrean));
        renderOrders();
    }
}

// --- 5. FITUR SALES ---
function renderPenjualan() {
    const dataSales = JSON.parse(localStorage.getItem("laporan_penjualan")) || [];
    const tbody = document.getElementById("tabel-penjualan");
    let total = 0;
    tbody.innerHTML = dataSales.map(s => {
        total += s.hargaJual;
        return `<tr><td>${s.tanggal}</td><td>${s.namaProduk}</td><td>Rp ${s.hargaJual.toLocaleString()}</td></tr>`;
    }).reverse().join("");
    document.getElementById("total-duit").innerText = `Rp ${total.toLocaleString()}`;
}

// --- 6. FITUR WEBSITE & BANNER ---
function previewCrop() {
    const pos = document.getElementById("banner-pos").value;
    document.getElementById("img-preview").style.objectPosition = pos;
}

function updateBanner() {
    const url = document.getElementById("banner-url").value;
    const pos = document.getElementById("banner-pos").value;
    if (url) {
        localStorage.setItem("banner_promo", url);
        localStorage.setItem("banner_posisi", pos);
        alert("Banner diperbarui!");
        loadBannerPreview();
    }
}

function loadBannerPreview() {
    const saved = localStorage.getItem("banner_promo");
    const savedPos = localStorage.getItem("banner_posisi") || "center";
    if (saved) {
        const img = document.getElementById("img-preview");
        img.src = "../assets/img/" + saved;
        img.style.objectPosition = savedPos;
        document.getElementById("banner-url").value = saved;
        document.getElementById("banner-pos").value = savedPos;
    }
}

// --- 7. LOGOUT & INITIALIZE ---
function logout() {
    sessionStorage.clear();
    window.location.href = "login.html";
}

window.onclick = function(event) {
    const modal = document.getElementById("modal-edit");
    if (event.target == modal) closeModal();
}

changePage('inventory');