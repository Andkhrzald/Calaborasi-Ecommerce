// File: auth_check.js
// Ini merupakan Security Middleware di sisi Front-End.
// Script ini wajib ditaruh di tag <head> sebelum layout body dirender oleh browser.

// Membaca sesi aktif pada API backend.
fetch("./backend/check_session.php")
  .then(res => res.json())
  .then(data => {
    // Jika tidak ada keterangan logged_in di PHP, halau dan kembalikan user secara paksa ke halaman login.
    if (data.status !== "logged_in") {
      window.location.href = "login.html";
    }
  });
