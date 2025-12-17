<?php
// api/db-config.php - FOR RAILWAY MYSQL
header('Content-Type: application/json');

// Turn off ALL error display - very important for JSON API
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);

// Railway MySQL Configuration
// Get these from your Railway dashboard -> MySQL -> Connect -> Private Network
$host = 'mysql.railway.internal'; // Railway's internal host
$port = 3306; // Default MySQL port
$dbname = 'railway'; // Usually 'railway' by default
$username = 'root'; // Default Railway username
$password = 'KEISKsZjOPJWhyLUaXHVrwQKjiIrYRut'; // Get from Railway variables

// ALTERNATIVE: If using MySQL Workbench with Railway connection
// Get connection details from Railway -> MySQL -> Connect -> External

try {
    // Using PDO for database connection
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_PERSISTENT => false
        ]
    );
    
    // Test connection
    $pdo->query("SELECT 1");
    
} catch (PDOException $e) {
    // Log error but don't output to client
    error_log("Railway DB Connection Error: " . $e->getMessage());
    throw new Exception("Database connection failed");
}
?>