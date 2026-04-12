<?php
include 'koneksi.php';

$product_id = $_POST['product_id'];
$size = $_POST['size'] ?? null;
$color = $_POST['color'] ?? null;
$stock = $_POST['stock'];

$query = "INSERT INTO product_variants (product_id, size, color, stock)
VALUES ('$product_id', '$size', '$color', '$stock')";

mysqli_query($conn, $query);

echo "success";
?>