<?php
include 'config.php';
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
$host = 'localhost';
$dbname = 'job_nexus';
$username = 'root';
$password = ''; // XAMPP default is empty

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]));
}

// Only handle POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $role = $input['role'] ?? 'candidate';
    
    // Validate input
    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Email and password are required']);
        exit();
    }
    
    // Check if user exists
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email AND role = :role");
    $stmt->execute([':email' => $email, ':role' => $role]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        // In production, use password_verify() with hashed passwords
        // For now, simple comparison (you should hash passwords!)
        if ($password === $user['password']) {
            // Get user profile based on role
            $profile = [];
            switch ($role) {
                case 'candidate':
                    $stmt = $pdo->prepare("SELECT * FROM candidate_profiles WHERE user_id = :user_id");
                    break;
                case 'recruiter':
                    $stmt = $pdo->prepare("SELECT * FROM recruiter_profiles WHERE user_id = :user_id");
                    break;
                case 'admin':
                    $stmt = $pdo->prepare("SELECT * FROM admin_profiles WHERE user_id = :user_id");
                    break;
            }
            
            if (isset($stmt)) {
                $stmt->execute([':user_id' => $user['id']]);
                $profile = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
            }
            
            // Get common profile
            $stmt = $pdo->prepare("SELECT * FROM profiles WHERE user_id = :user_id");
            $stmt->execute([':user_id' => $user['id']]);
            $commonProfile = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
            
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'profile' => array_merge($commonProfile, $profile)
                ],
                'token' => base64_encode(json_encode([
                    'userId' => $user['id'],
                    'email' => $user['email'],
                    'role' => $user['role']
                ]))
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid password']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>