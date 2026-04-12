// --- 1. PROTEKSI & DATA AWAL ---
const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
if (!user) window.location.href = "login.html";

document.getElementById("user-display").innerText = user.username;
document.getElementById("role-display").innerText = "Jabatan: " + user.role;

// Gunakan fungsi untuk selalu ambil data fresh dari localStorage
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

// --- 3. FITUR INVENTORY (DENGAN FITUR EDIT) ---
function renderInventory() {
    const tbody = document.getElementById("tabel-body");
    const dataProduk = getProduk();

    tbody.innerHTML = dataProduk.map((p, index) => `
        <tr>
            <td>
                <img src="../assets/img/${p.gambar}" width="50" height="50" style="object-fit:cover" onerror="this.src='https://via.placeholder.com/50'">
                <input type="text" id="edit-img-${index}" value="${p.gambar}" style="width: 80px; font-size: 10px; display:block; margin-top:5px;" placeholder="nama_file.jpg">
            </td>
            <td><input type="text" id="edit-nama-${index}" value="${p.nama}" style="width: 100%; font-weight:bold;"></td>
            <td><input type="number" id="edit-harga-${index}" value="${p.harga}" style="width: 100px;"></td>
            <td><input type="number" id="edit-stok-${index}" value="${p.stok}" style="width: 60px;"> Pcs</td>
            <td>
                <button class="btn-save" onclick="updateProduk(${index})" style="background:#2563eb; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Simpan</button>
                <button class="btn-delete" onclick="hapusProduk(${p.id})" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Hapus</button>
            </td>
        </tr>
    `).join("");

    if (user.role === "Warehouse") {
        document.getElementById("input-area").style.display = "none";
    }
}

function updateProduk(index) {
    let dataProduk = getProduk();
    
    // Ambil nilai dari input yang sedang diedit
    dataProduk[index].nama = document.getElementById(`edit-nama-${index}`).value;
    dataProduk[index].harga = document.getElementById(`edit-harga-${index}`).value;
    dataProduk[index].stok = parseInt(document.getElementById(`edit-stok-${index}`).value);
    dataProduk[index].gambar = document.getElementById(`edit-img-${index}`).value;

    localStorage.setItem("produk_clothing", JSON.stringify(dataProduk));
    alert("Data Berhasil Diperbarui!");
    renderInventory();
}

function tambahProduk() {
    const n = document.getElementById("nama").value;
    const h = document.getElementById("harga").value;
    const s = parseInt(document.getElementById("stok").value);
    const g = document.getElementById("gambar").value;

    if (n && h && s && g) {
        let dataProduk = getProduk();
        dataProduk.push({ id: Date.now(), nama: n, harga: h, stok: s, gambar: g, creator: user.username });
        localStorage.setItem("produk_clothing", JSON.stringify(dataProduk));
        renderInventory();
        alert("Produk Berhasil Disimpan!");
        // Reset form
        document.getElementById("nama").value = "";
        document.getElementById("harga").value = "";
        document.getElementById("stok").value = "";
        document.getElementById("gambar").value = "";
    } else {
        alert("Lengkapi semua data!");
    }
}

function hapusProduk(id) {
    if (confirm("Hapus produk ini?")) {
        let dataProduk = getProduk();
        dataProduk = dataProduk.filter(p => p.id !== id);
        localStorage.setItem("produk_clothing", JSON.stringify(dataProduk));
        renderInventory();
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
                <button onclick="approveOrder(${index})" style="background:#10b981; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-weight:bold;">Approve</button>
                <button onclick="rejectOrder(${index})" style="background:#ef4444; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-weight:bold;">Reject</button>
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
            alert("Gagal Approve: Stok produk sudah habis!");
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
    const totalDisplay = document.getElementById("total-duit");

    let total = 0;
    tbody.innerHTML = dataSales.map(s => {
        total += s.hargaJual;
        return `<tr><td>${s.tanggal}</td><td>${s.namaProduk}</td><td>Rp ${s.hargaJual.toLocaleString()}</td></tr>`;
    }).reverse().join("");

    totalDisplay.innerText = `Rp ${total.toLocaleString()}`;
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

// --- 7. LOGOUT ---
function logout() {
    sessionStorage.clear();
    window.location.href = "login.html";
}

changePage('inventory');