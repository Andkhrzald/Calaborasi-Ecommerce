<?php
include 'koneksi.php';

$query = "
SELECT
orders.id,
products.name,
products.price,
product_variants.size,
product_variants.color,
orders.quantity,
orders.status,
orders.customer_name
FROM orders
JOIN products ON orders.product_id = products.id
LEFT JOIN product_variants ON orders.variant_id = product_variants.id
";

$result = mysqli_query($conn, $query);

$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

echo json_encode($data);
?>