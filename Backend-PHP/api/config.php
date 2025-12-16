<?php
$host = "shinkansen.proxy.rlwy.net";
$port = "58540";
$user = "root";
$password = "KEISKsZjOPJWhyLUaXHVrwQKjiIrYRut";
$database = "railway";

$conn = mysqli_connect($host, $user, $password, $database, $port);

if (!$conn) {
    die("Database connection failed: " . mysqli_connect_error());
}
?>
