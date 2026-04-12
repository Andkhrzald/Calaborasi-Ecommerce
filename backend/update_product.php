<?php
include 'koneksi.php';

$id = $_POST['id'];
$stock = $_POST['stock'];

$query = "UPDATE product_variants SET stock='$stock' WHERE id='$id'";

if(mysqli_query($conn, $query)){
    echo "berhasil";
} else {
    echo "error";
}
?>