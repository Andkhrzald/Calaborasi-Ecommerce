<?php
include 'koneksi.php';

$id = $_POST['id'];
$status = $_POST['status'];

// 🔥 ambil status lama
$check = mysqli_query($conn, "SELECT status FROM orders WHERE id='$id'");
$row = mysqli_fetch_assoc($check);

$oldStatus = $row['status'];

// ❌ kalau sudah selesai / cancel
if($oldStatus == 'done' || $oldStatus == 'cancel'){
    echo "Order tidak bisa diubah";
    exit;
}

// 🔥 VALIDASI FLOW
$allowed = false;

if($oldStatus == 'pending' && $status == 'process'){
    $allowed = true;
}

if($oldStatus == 'process' && $status == 'shipped'){
    $allowed = true;
}

if($oldStatus == 'shipped' && $status == 'done'){
    $allowed = true;
}

// ❌ kalau lompat
if(!$allowed){
    echo "Flow status tidak valid!";
    exit;
}

// ✅ BARU UPDATE
mysqli_query($conn, "UPDATE orders SET status='$status' WHERE id='$id'");


// 🔥 kalau DONE → kurangi stock
if($status == 'done'){

    $order = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM orders WHERE id='$id'"));

    $variant_id = $order['variant_id'];
    $qty = $order['quantity'];

    mysqli_query($conn, "
        UPDATE product_variants
        SET stock = stock - $qty
        WHERE id = '$variant_id'
    ");
}

echo "success";