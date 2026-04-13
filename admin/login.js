// File: login.js
// Fungsi ini mencegah halaman reload saat tombol submit ditekan.
// Lalu mengirim data form secara diam-diam (background) ke API login di backend.
document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault(); // Mencegah reload halaman standar

  // Mengambil nilai teks dari kolom input
  const username = document.getElementById("user").value;
  const password = document.getElementById("pass").value;

  // Menembak backend PHP lewat fetch AJAX
  fetch("./backend/login.php", {
    method: "POST", // Membawa tipe data POST demi keamanan
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password }) // Mengubah data menjadi JSON string
  })
    .then(res => res.json()) // Mengubah respon dari PHP balik menjadi objek Javascript
    .then(data => {
      // Mengecek 'status' yang dicetak ulang oleh PHP
      if (data.status === "success") {
        // Jika cocok, langsung alihkan atau lempar paksa ke dashboard
        window.location.href = "index.html";
      } else {
        // Jika salah, tampilkan pesan gagal
        alert(data.message);
      }
    });
});
