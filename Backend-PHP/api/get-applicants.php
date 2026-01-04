<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once __DIR__ . '/../config/database.php';

$recruiter_id = $_GET["recruiter_id"] ?? null;

if (!$recruiter_id) {
    echo json_encode([
        "success" => false,
        "message" => "recruiter_id is required"
    ]);
    exit;
}

try {
    // ✅ Railway PDO connection
    $database = new Database();
    $db = $database->getConnection();

    $sql = "
    SELECT 
        a.id AS application_id,
        a.status,
        a.applied_at,
        a.resume_filename,  
        j.title AS job_title,
        j.id AS job_id,     
        u.full_name AS candidate_name,
        u.email AS candidate_email,
        u.id AS candidate_id  
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN users u ON a.candidate_id = u.id
    WHERE j.recruiter_id = ?
    ORDER BY a.applied_at DESC
";

    $stmt = $db->prepare($sql);
    $stmt->execute([$recruiter_id]);

    $applications = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "applications" => $applications
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
