// api/verify-role.php or include in all endpoints
function verifyRole($requiredRole) {
    session_start();
    
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Not authenticated"]);
        exit();
    }
    
    $userRole = $_SESSION['user_role'];
    
    if ($userRole !== $requiredRole) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Insufficient permissions"]);
        exit();
    }
    
    return $_SESSION['user_id'];
}

// In each endpoint file:
// For candidate-only endpoint:
verifyRole('candidate');

// For recruiter-only endpoint:
verifyRole('recruiter');

// For admin-only endpoint:
verifyRole('admin');