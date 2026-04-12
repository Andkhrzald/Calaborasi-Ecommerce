<?php
include 'koneksi.php';

$id = $_GET['id'];

$query = "DELETE FROM product_variants WHERE id='$id'";

if(mysqli_query($conn, $query)){
    echo "berhasil";
} else {
    echo "error";
}
?>