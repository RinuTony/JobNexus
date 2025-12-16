<?php
include 'config.php';
// Enable ALL error reporting at the VERY TOP
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// Headers for CORS
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

echo json_encode(['debug' => 'Script started']);
flush();

// Database configuration
$host = 'localhost';
$dbname = 'job_nexus';
$username = 'root';
$password = '';

echo json_encode(['debug' => 'Before PDO connection']);
flush();

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    echo json_encode(['debug' => 'Database connected successfully']);
    flush();
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Database connection failed',
        'error' => $e->getMessage()
    ]);
    exit();
}

// Only handle POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    echo json_encode(['debug' => 'POST request received']);
    flush();
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    echo json_encode(['debug' => 'Input received', 'input' => $input]);
    flush();
    
    if (!$input) {
        echo json_encode([
            'success' => false, 
            'message' => 'Invalid JSON input. Received: ' . file_get_contents('php://input')
        ]);
        exit();
    }
    
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $role = $input['role'] ?? 'candidate';
    $firstName = $input['firstName'] ?? '';
    $lastName = $input['lastName'] ?? '';
    
    echo json_encode(['debug' => 'Parsed data', 'email' => $email, 'role' => $role]);
    flush();
    
    // Validate input
    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Email and password are required']);
        exit();
    }
    
    // Check if user already exists
    try {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        
        echo json_encode(['debug' => 'Checked for existing user']);
        flush();
        
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Email already registered']);
            exit();
        }
        
        // In production, hash the password!
        // $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        echo json_encode(['debug' => 'Starting transaction']);
        flush();
        
        // Start transaction
        $pdo->beginTransaction();
        
        // Insert user
        $stmt = $pdo->prepare("INSERT INTO users (email, password, role) VALUES (:email, :password, :role)");
        $stmt->execute([
            ':email' => $email,
            ':password' => $password, // In production: $hashedPassword
            ':role' => $role
        ]);
        
        $userId = $pdo->lastInsertId();
        
        echo json_encode(['debug' => 'User inserted', 'userId' => $userId]);
        flush();
        
        // Insert profile
        $stmt = $pdo->prepare("INSERT INTO profiles (user_id, first_name, last_name) VALUES (:user_id, :first_name, :last_name)");
        $stmt->execute([
            ':user_id' => $userId,
            ':first_name' => $firstName,
            ':last_name' => $lastName
        ]);
        
        echo json_encode(['debug' => 'Profile inserted']);
        flush();
        
        // Create role-specific profile
        $tableName = '';
        switch ($role) {
            case 'candidate':
                $tableName = 'candidate_profiles';
                break;
            case 'recruiter':
                $tableName = 'recruiter_profiles';
                break;
            case 'admin':
                $tableName = 'admin_profiles';
                break;
        }
        
        if ($tableName) {
            $stmt = $pdo->prepare("INSERT INTO $tableName (user_id) VALUES (:user_id)");
            $stmt->execute([':user_id' => $userId]);
            
            echo json_encode(['debug' => "Role profile inserted into $tableName"]);
            flush();
        }
        
        // Commit transaction
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful',
            'userId' => $userId
        ]);
        
    } catch (Exception $e) {
        // Rollback on error
        $pdo->rollBack();
        
        echo json_encode([
            'success' => false, 
            'message' => 'Registration failed',
            'error' => $e->getMessage(),
            'error_trace' => $e->getTraceAsString()
        ]);
        exit();
    }
    
} else {
    // Not a POST request
    echo json_encode([
        'success' => false, 
        'message' => 'Invalid request method. Use POST.',
        'received_method' => $_SERVER['REQUEST_METHOD']
    ]);
}
?>