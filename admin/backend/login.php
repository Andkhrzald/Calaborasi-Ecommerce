<?php
// FILE: login.php
// Fungsi: Memproses data Username dan Password yang dikirim dari form (kode JS di login.js).

require 'config.php'; // Memanggil koneksi database

// Set wajib agar JavaScript di Frontend tahu bahwa responnya berformat JSON
header("Content-Type: application/json");

// 1. MENANGKAP DATA
// Menangkap data 'body' paket JSON yang dikirim oleh Javascript melalui fetch
$data = json_decode(file_get_contents("php://input"), true);

// Memasukkan inputan ke dalam variabel. Jika kosong, akan diisi spasi ('')
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

// Mencegah proses berlanjut jika kolom ada yang tidak diisi
if (!$username || !$password) {
    echo json_encode(["status" => "error", "message" => "Input kosong"]);
    exit; // Berhenti di sini
}

// 2. MENCARI DI DATABASE
// Mengamankan query MYSQL dengan metode "Prepare Statement" untuk MENCEGAH serangan Hacker (SQL Injection)
$stmt = $conn->prepare("SELECT * FROM admin_users WHERE username = ?");
$stmt->bind_param("s", $username); // Huruf "s" artinya inputan (username) berupa String
$stmt->execute();
$result = $stmt->get_result();

// Mengecek apakah data dengan username tersebut benar-benar ada di tabel database
if ($user = $result->fetch_assoc()) {
    
    // 3. MENCOCOKKAN PASSWORD
    // Ini tahap paling krusial. Kata sandi (contoh "123456") akan DICIPTAKAN KE DALAM BENTUK HASH SESAAT,
    // lalu dicocokkan dengan hasil hash $2y$10 yang tersimpan mati di dalam Database. 
    if (password_verify($password, $user['password'])) {
        
        // JIKA COCOK (LOGIN BERHASIL):
        // Kita ciptakan "Tanda Pengenal" ($_SESSION) supaya semua satpam file PHP lain
        // tahu bahwa orang yang membuka browser saat ini adalah admin yang sah.
        $_SESSION['login'] = true;
        $_SESSION['role'] = $user['role']; // Simpan jabatannya di memori server

        // Kirim konfirmasi "success" ke JS agar layarnya berpindah (dilempar) ke halaman dashboard.
        echo json_encode([
            "status" => "success",
            "role" => $user['role']
        ]);

    } else {
        // JIKA PASSWORD SALAH
        echo json_encode(["status" => "error", "message" => "Password salah"]);
    }

} else {
    // JIKA USERNAME TIDAK MUNCUL DI TABEL
    echo json_encode(["status" => "error", "message" => "User tidak ditemukan"]);
}