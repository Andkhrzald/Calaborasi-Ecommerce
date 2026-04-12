<?php
include 'koneksi.php';

$query = "
SELECT 
products.id as product_id,
products.name,
products.brand,
products.category,
products.price,
product_variants.id as variant_id,
product_variants.size,
product_variants.color,
product_variants.stock
FROM products
JOIN product_variants 
ON products.id = product_variants.product_id
";

$result = mysqli_query($conn, $query);

$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

echo json_encode($data);
?>