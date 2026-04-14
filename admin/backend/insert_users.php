<?php
require 'config.php';

// Data user baru
$users = [
    ["admin", "11111", "admin"],
    ["staff", "22222", "staff"]
];

foreach ($users as $u) {
    $username = $u[0];
    $password = password_hash($u[1], PASSWORD_DEFAULT);
    $role = $u[2];

    // Cek apakah user sudah ada
    $check = $conn->prepare("SELECT * FROM admin_users WHERE username = ?");
    $check->bind_param("s", $username);
    $check->execute();
    $result = $check->get_result();

    if ($result->num_rows == 0) {
        $stmt = $conn->prepare("INSERT INTO admin_users (username, password, role) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $username, $password, $role);
        $stmt->execute();
        echo "User $username berhasil ditambahkan<br>";
    } else {
        echo "User $username sudah ada<br>";
    }
}