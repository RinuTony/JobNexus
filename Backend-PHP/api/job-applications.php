<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once __DIR__ . '/../config/database.php';

$job_id = $_GET['job_id'] ?? null;

if (!$job_id) {
    echo json_encode([
        "success" => false,
        "message" => "Job ID required"
    ]);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "
    SELECT 
        a.*,
        u.full_name AS candidate_name,
        u.email AS candidate_email,
        u.id AS candidate_id  // ADD THIS
    FROM applications a
    JOIN users u ON a.candidate_id = u.id
    WHERE a.job_id = :job_id
    ORDER BY a.applied_at DESC
";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':job_id', $job_id, PDO::PARAM_INT);
    $stmt->execute();

    $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "applications" => $applications
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to fetch job applications"
    ]);
}
