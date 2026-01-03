<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

require_once __DIR__ . '/../config/database.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$userId = $input['userId'] ?? 0;
$userRole = $input['role'] ?? 'candidate'; // Get role from input

if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'User ID required']);
    exit();
}

try {
    // ✅ Use Database class instead of creating own PDO
    $database = new Database();
    $db = $database->getConnection();
    
    // Start transaction
    $db->beginTransaction();
    
    // Update common profile
    $stmt = $db->prepare("
        INSERT INTO profiles (user_id, first_name, last_name, phone) 
        VALUES (:user_id, :first_name, :last_name, :phone)
        ON DUPLICATE KEY UPDATE 
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        phone = VALUES(phone)
    ");
    
    $stmt->execute([
        ':user_id' => $userId,
        ':first_name' => $input['firstName'] ?? '',
        ':last_name' => $input['lastName'] ?? '',
        ':phone' => $input['phone'] ?? ''
    ]);
    
    // Update role-specific profile based on user's role
    $roleTable = '';
    switch ($userRole) {
        case 'candidate':
            $roleTable = 'candidate_profiles';
            break;
        case 'recruiter':
            $roleTable = 'recruiter_profiles';
            break;
        case 'admin':
            $roleTable = 'admin_profiles';
            break;
    }
    
    if ($roleTable) {
        // Check if role profile exists
        $checkStmt = $db->prepare("SELECT COUNT(*) FROM $roleTable WHERE user_id = :user_id");
        $checkStmt->execute([':user_id' => $userId]);
        
        if ($checkStmt->fetchColumn() > 0) {
            // Update existing
            // Add more fields as needed based on your table structure
            $updateStmt = $db->prepare("
                UPDATE $roleTable 
                SET updated_at = NOW()
                WHERE user_id = :user_id
            ");
            $updateStmt->execute([':user_id' => $userId]);
        } else {
            // Insert new
            $insertStmt = $db->prepare("INSERT INTO $roleTable (user_id) VALUES (:user_id)");
            $insertStmt->execute([':user_id' => $userId]);
        }
    }
    
    // Commit transaction
    $db->commit();
    
    echo json_encode([
        'success' => true, 
        'message' => 'Profile updated successfully'
    ]);
    
} catch (PDOException $e) {
    // Rollback on error
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Profile update failed',
        'error' => $e->getMessage()
    ]);
}
?>