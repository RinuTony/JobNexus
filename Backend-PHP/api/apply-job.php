<?php
include 'config.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Initialize response array
$response = ["success" => false, "message" => ""];

try {
    $conn = new mysqli($host,$username,$password,$dbname,$port);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Get JSON input
    $json = file_get_contents("php://input");
    $data = json_decode($json, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON input");
    }
    
    $job_id = $data["job_id"] ?? null;
    $candidate_id = $data["candidate_id"] ?? null;
    
    if (!$job_id || !$candidate_id) {
        throw new Exception("Missing job_id or candidate_id");
    }
    
    // Check if already applied
    $checkStmt = $conn->prepare(
        "SELECT id FROM applications WHERE job_id = ? AND candidate_id = ?"
    );
    $checkStmt->bind_param("ii", $job_id, $candidate_id);
    $checkStmt->execute();
    $checkStmt->store_result();
    
    if ($checkStmt->num_rows > 0) {
        $response["message"] = "You have already applied to this job";
        echo json_encode($response);
        exit;
    }
    $checkStmt->close();
    
    // Insert application
    $stmt = $conn->prepare(
        "INSERT INTO applications (job_id, candidate_id) VALUES (?, ?)"
    );
    $stmt->bind_param("ii", $job_id, $candidate_id);
    
    if ($stmt->execute()) {
        $response["success"] = true;
        $response["message"] = "Application submitted successfully";
    } else {
        throw new Exception("Database error: " . $stmt->error);
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    $response["message"] = $e->getMessage();
}

// Ensure only JSON is output
echo json_encode($response);
exit;