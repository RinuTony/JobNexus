<?php
// config/database.php

class Database {
    private $host = "shinkansen.proxy.rlwy.net";
    private $port = "58540";
    private $dbname = "railway";
    private $username = "root";
    private $password = "KEISKsZjOPJWhyLUaXHVrwQKjiIrYRut";
    private $conn;

    public function getConnection() {
        $this->conn = null;
        
        try {
            $dsn = "mysql:host=" . $this->host . 
                   ";port=" . $this->port . 
                   ";dbname=" . $this->dbname . 
                   ";charset=utf8mb4";
            
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Database connection failed: " . $e->getMessage()
            ]);
            exit;
        }
        
        return $this->conn;
    }
}

// Optional: Create a global PDO instance for backward compatibility
try {
    $database = new Database();
    $pdo = $database->getConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database initialization failed"
    ]);
    exit;
}
?>