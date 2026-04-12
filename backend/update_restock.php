<?php
include 'koneksi.php';

$id = $_POST['id'];
$status = $_POST['status'];

// update status dulu
mysqli_query($conn, "UPDATE restock_requests SET status='$status' WHERE id='$id'");

// kalau approve → tambah stock
if($status == 'approved'){
    
    $get = mysqli_query($conn, "
    SELECT variant_id, qty 
    FROM restock_requests 
    WHERE id='$id'
    ");

    $data = mysqli_fetch_assoc($get);

    $variant_id = $data['variant_id'];
    $qty = $data['qty'];

    mysqli_query($conn, "
    UPDATE product_variants 
    SET stock = stock + $qty 
    WHERE id='$variant_id'
    ");
}

echo "Status updated";
?>