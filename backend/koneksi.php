<?php
$conn = mysqli_connect("localhost", "root", "", "ecommerce_dashboard");

if (!$conn) {
    die("Koneksi gagal: " . mysqli_connect_error());
}
?>