<?php
// FILE: check_session.php
// Fungsi: Mengecek apakah pengunjung browser saat ini sudah login atau belum.
// Ini adalah sistem keamanan "Satpam" di sisi backend.

// Memanggil koneksi database dan menyalakan session dari config.php
require 'config.php';

// Memberitahu browser bahwa balasan dari file ini berbentuk JSON (bukan HTML)
header("Content-Type: application/json");

// Mengecek apakah terdapat "Tanda Pengenal" (Session) bernama 'login' di server PHP
// dan apakah nilainya benar-benar 'true'
if (isset($_SESSION['login']) && $_SESSION['login'] === true) {
    // Jika tanda pengenalnya valid, berikan balasan ke JavaScript bahwa user ini AMAN ("logged_in")
    // Kita juga mengirimkan jabatannya ('role') untuk bisa dipakai di Dashboard (misal: "Owner")
    echo json_encode([
        "status" => "logged_in",
        "role" => $_SESSION['role']
    ]);
} else {
    // Jika tidak ada tanda pengenal (belum login atau sesi kedaluwarsa),
    // berikan balasan "unauthorized" (Tidak sah).
    // JavaScript di Frontend (auth_check.js) akan membaca pesan ini lalu menendang user ke halaman login.
    echo json_encode(["status" => "unauthorized"]);
}