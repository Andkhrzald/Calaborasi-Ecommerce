<?php
include 'koneksi.php';

$id = $_POST['id'];

// ambil data request
$get = mysqli_query($conn, "SELECT * FROM restock_requests WHERE id=$id");
$data = mysqli_fetch_assoc($get);

$variant_id = $data['variant_id'];
$qty = $data['qty'];

// tambah stock
mysqli_query($conn, "
UPDATE product_variants 
SET stock = stock + $qty 
WHERE id = $variant_id
");

// ubah status jadi approved
mysqli_query($conn, "
UPDATE restock_requests 
SET status='approved' 
WHERE id=$id
");

// cek dulu status
$check = mysqli_query($conn, "SELECT status FROM restock_requests WHERE id=$id");
$row = mysqli_fetch_assoc($check);

if($row['status'] == 'approved'){
    echo "Sudah di approve sebelumnya";
    exit;
}

echo "approved";
?>