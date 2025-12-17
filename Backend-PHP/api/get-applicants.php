<?php
include "config.php";
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli($host,$username,$password,$dbname,$port);

$recruiter_id = $_GET["recruiter_id"] ?? null;

if (!$recruiter_id) {
  echo json_encode(["success" => false]);
  exit;
}

$sql = "
SELECT 
  a.id AS application_id,
  a.status,
  a.applied_at,
  j.title AS job_title,
  u.full_name AS candidate_name,
  u.email AS candidate_email
FROM applications a
JOIN jobs j ON a.job_id = j.id
JOIN users u ON a.candidate_id = u.id
WHERE j.recruiter_id = ?
ORDER BY a.applied_at DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $recruiter_id);
$stmt->execute();

$result = $stmt->get_result();
$applicants = [];

while ($row = $result->fetch_assoc()) {
  $applicants[] = $row;
}

echo json_encode([
  "success" => true,
  "applications" => $applicants
]);
