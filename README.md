# Ecommerce Dashboard

## Overview

Proyek ini adalah contoh e-commerce sederhana yang dibagi menjadi dua bagian utama:

- `website-cus/`: aplikasi customer-facing untuk menampilkan produk, keranjang, dan halaman checkout.
- `admin/`: dashboard admin untuk mengelola produk, melihat antrean pesanan, dan laporan penjualan.

## Customer Website Flow

### 1. Halaman utama `website-cus/page/website.html`

- Menampilkan katalog produk di `product-list`.
- Data produk diambil dari `localStorage` dengan kunci `produk_clothing` jika tersedia.
- Jika tidak ada data admin, script fallback menggunakan daftar produk statis.
- Setiap kartu produk menampilkan nama, harga, stok, rating, dan tombol `+ Keranjang`.
- Saat tombol keranjang diklik, fungsi `addToCart(name, price)` di `website-cus/assets/js/website.js` dijalankan.

### 2. Menambahkan produk ke keranjang

- `addToCart()` mencari produk di `allProducts` berdasarkan `name`.
- Jika produk ditemukan dan stok masih tersedia, produk ditambahkan atau jumlahnya ditingkatkan.
- Jika item sudah ada di keranjang, script memeriksa batas stok dan hanya menambah jika masih tersedia.
- Keranjang disimpan ke `localStorage` di kunci `cart`.
- UI keranjang diperbarui oleh `updateCartUI()` dan total dihitung ulang.

### 3. Keranjang dan checkout

- Keranjang ditampilkan di sidebar kanan.
- Jumlah barang total diambil dari `cart` dan ditampilkan di `cartCount`.
- Tombol `checkout()` di `website.js` seharusnya membawa pengguna ke halaman `checkout.html`.
- Namun, pada kode saat ini, fungsi `checkout()` memanggil `localStorage.setItem('customerName', customer)`, menggunakan variabel `customer` yang tidak didefinisikan di script. Ini adalah titik logika yang belum lengkap.

### 4. Halaman checkout `website-cus/page/checkout.html`

- Memuat `website-cus/assets/js/checkout.js`.
- Fungsi `loadCart()` membaca `cart` dari `localStorage` dan `customerName` dari localStorage.
- Jika tidak ada `cart`, user dialihkan kembali ke halaman utama.
- `renderOrderSummary()` membuat ringkasan pesanan di `order-items`.
- Total checkout dihitung dari semua item di keranjang.
- Form checkout mengumpulkan:
  - nama lengkap
  - email
  - nomor telepon
  - alamat
  - catatan tambahan

### 5. Proses submit checkout

- `checkout.js` menunggu submit form `checkout-form`.
- Ketika form disubmit, data customer dibaca dari input.
- Kemudian setiap item keranjang ditambahkan ke antrean pesanan (`antrean_pesanan`) di `localStorage`.
- Format data yang disimpan tiap item adalah:
  - `tanggal`
  - `namaProduk` dengan format `Nama Produk (xQty)`
  - `hargaJual` total untuk item tersebut
- Setelah submit berhasil:
  - muncul alert pesanan berhasil
  - localStorage `cart` dihapus
  - pesanan disimpan di `localStorage.order_history` untuk customer tracking
  - ID pesanan terakhir disimpan di `localStorage.last_order_id`
  - pengunjung diarahkan ke halaman `order-status.html`
  - halaman status akan menampilkan `pending`, `packing`, `dikirim`, atau `sampai tujuan` secara visual
  - setelah kembali ke halaman utama, customer dapat klik tombol `Lihat Status Pesanan` untuk melihat order terakhir lagi

## Admin Dashboard Flow

### 1. Login admin `admin/login.html`

- Halaman login menggunakan data user hardcoded:
  - `admin_brand` / `123` → Owner
  - `crew_stok` / `456` → Warehouse
  - `crew_input` / `789` → Staff
- Jika login sukses, data user disimpan di `sessionStorage` sebagai `loggedInUser`.
- Pengguna diarahkan ke `admin/index.html`.

### 2. Dashboard admin `admin/index.html` + `admin/script.js`

- `script.js` membaca user login dari `sessionStorage`.
- Jika tidak ada user, halaman langsung dialihkan ke `login.html`.
- Dashboard memiliki beberapa halaman internal:
  - `inventory` untuk manajemen produk
  - `sales` untuk laporan penjualan
  - `website` untuk preview banner promo
  - `orders` untuk approves pesanan

### 3. Inventory management

- Produk diambil dari `localStorage` kunci `produk_clothing`.
- Setiap baris inventori menampilkan nama, harga, stok, dan file gambar.
- Admin bisa:
  - mengedit nama, harga, stok, dan nama gambar
  - menyimpan perubahan dengan `updateProduk(index)`
  - menghapus produk dengan `hapusProduk(id)`
  - menambah produk baru dengan `tambahProduk()`
- Data produk tetap tersimpan di browser dan dipakai kembali di website customer.

### 4. Order approval

- Halaman `orders` membaca antrean dari `localStorage` kunci `antrean_pesanan`.
- Setiap pesanan memiliki tombol `Approve` dan `Reject`.
- `approveOrder(index)` melakukan:
  - mengurangi stok produk di `produk_clothing` sebesar 1 jika masih tersedia
  - memindahkan item ke laporan penjualan `laporan_penjualan`
  - menghapus item dari antrean
- `rejectOrder(index)` hanya menghapus order dari antrean.

### 5. Laporan penjualan

- Halaman `sales` menampilkan semua pesanan yang sudah disetujui.
- Data diambil dari `localStorage` kunci `laporan_penjualan`.
- Total pendapatan dihitung dari `hargaJual` setiap order.

### 6. Preview banner website

- Halaman `website` di admin memungkinkan update gambar banner promo.
- Banner disimpan di `localStorage` sebagai `banner_promo` dan `banner_posisi`.
- Preview ditampilkan di admin dashboard saja.

### 7. Logout

- Fungsi `logout()` membersihkan `sessionStorage` dan mengarahkan kembali ke `login.html`.

## Data Storage

Semua data dinamis saat ini disimpan di browser, bukan di server:

- `produk_clothing`: daftar produk admin
- `cart`: isi keranjang customer
- `antrean_pesanan`: order checkout yang masuk
- `laporan_penjualan`: pesanan yang sudah diapprove admin
- `banner_promo`, `banner_posisi`: banner website promo
- `loggedInUser`: data user admin yang login

## Catatan penting

- Koneksi backend sebenarnya hanya dipakai di `website-cus/assets/js/product.js` untuk detail produk, tetapi website customer utama saat ini mengandalkan `localStorage`.
- Beberapa elemen UI seperti filter kategori dan search pada `website.html` terlihat ada di tampilan, namun logic JavaScript untuk fitur tersebut belum lengkap.
- Alur checkout customer menyimpan order di `localStorage` dan kemudian admin memproses pesanan tersebut secara manual.

## Cara menjalankan

1. Buka proyek di web server lokal seperti Laragon atau Live Server.
2. Akses customer store melalui `website-cus/page/website.html`.
3. Akses admin dashboard melalui `admin/login.html`.

---

README ini menjelaskan proses end-to-end dari pemilihan produk oleh customer sampai order diterima oleh admin, termasuk manajemen inventori dan laporan penjualan. 
