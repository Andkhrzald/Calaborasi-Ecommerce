<?php
include 'koneksi.php';

$query = "
SELECT 
restock_requests.id,
products.name,
product_variants.size,
product_variants.color,
restock_requests.qty,
restock_requests.status,
restock_requests.variant_id
FROM restock_requests
JOIN products ON restock_requests.product_id = products.id
JOIN product_variants ON restock_requests.variant_id = product_variants.id
";

$result = mysqli_query($conn, $query);

$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

echo json_encode($data);
?>