<?php
include 'koneksi.php';

$product_id = $_POST['product_id'];
$variant_id = $_POST['variant_id'];
$qty = $_POST['qty'];

// ✅ VALIDASI
if(!$product_id || !$variant_id || !$qty){
    echo "Field kosong";
    exit;
}

if($qty <= 0){
    echo "Qty tidak valid";
    exit;
}

// ✅ CEK APAKAH SUDAH ADA REQUEST PENDING
$check = mysqli_query($conn, "
SELECT * FROM restock_requests 
WHERE variant_id='$variant_id' AND status='pending'
");

if(mysqli_num_rows($check) > 0){
    echo "Masih ada request pending!";
    exit;
}

// ✅ INSERT DATA
$query = "INSERT INTO restock_requests (product_id, variant_id, qty, status)
VALUES ('$product_id', '$variant_id', '$qty', 'pending')";

if(mysqli_query($conn, $query)){
    echo "berhasil";
} else {
    echo "error: " . mysqli_error($conn);
}
?>