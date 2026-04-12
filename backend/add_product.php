<?php
include 'koneksi.php';

$name = $_POST['name'];
$brand = $_POST['brand'];
$category = $_POST['category'];
$price = $_POST['price'];

$query = "INSERT INTO products (name, brand, category, price)
VALUES ('$name', '$brand', '$category', '$price')";

mysqli_query($conn, $query);

echo "success";
?>