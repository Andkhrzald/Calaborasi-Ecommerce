<?php
// FILE: config.php
// Fungsi: Sebagai jembatan penghubung antara PHP dengan Database MySQL.
// File ini wajib di-include (dipanggil) oleh file PHP lain yang butuh akses data.

// 1. Kredensial Database
$host = "localhost"; // Karena berjalan di komputer lokal (Laragon), servernya bernama localhost
$user = "root";      // Username default dari MySQL bawaan Laragon adalah 'root'
$pass = "";          // Password default dari MySQL bawaan Laragon biasanya kosong (tidak ada)
$db   = "ecommerce-collaboration"; // Nama database tujuan yang memuat tabel 'admin_users' Anda.

// 2. Membuka Koneksi
// Menjalankan fungsi koneksi MySQLi dengan kredensial di atas
$conn = new mysqli($host, $user, $pass, $db);

// 3. Mengecek Kesalahan (Error Handling)
if ($conn->connect_error) {
    // Jika nama database salah atau mysql belum dinyalakan, website PHP akan berhenti
    // dan memunculkan tulisan "Koneksi gagal".
    die("Koneksi gagal: " . $conn->connect_error);
}

// 4. Memulai Ruang Sesi (Session)
// Memulai/Menyalakan fitur penyimpanan memori berbasis server (Session).
// Sangat krusial agar memori PHP 'ingat' kalau Admin sudah berhasil login, sehingga mereka tidak disuruh login berulang kali.
session_start();