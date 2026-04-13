<?php
// FILE: logout.php
// Fungsi: Digunakan saat tombol "Log Out" di Dashboard ditekan. 
// Bertugas menghilangkan Tanda Pengenal dari Server secara permanen.

// Memanggil config agar kita bisa mengakses sistem _SESSION
require 'config.php';

// Menghancurkan seluruh ingatan sesi (Session) milik User ini di dalam server PHP.
// Akibatnya, saat pengunjung mencoba mereload halaman dashboard, 
// satpam di check_session.php akan mendeteksi dia tak punya tanda pengenal lagi (karena sudah dihancurkan),
// lalu ia akan otomatis ditendang keluar ke login.html
session_destroy();

// Mengirimkan konfirmasi ke penekan tombol (script.js) bahwa sesi sudah lenyap
echo json_encode(["status" => "logout"]);