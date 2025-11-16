<?php
// PRODUCTION DATABASE CONFIGURATION
// Update these values on your Bluehost server

// Disable error reporting in production
error_reporting(0);
ini_set('display_errors', 0);

// Database configuration - UPDATE THESE ON BLUEHOST!
define('DB_HOST', 'localhost');
define('DB_USER', 'pflugera_phoenix_user');
define('DB_PASS', 'wuptac-7keRqi-gukrur');
define('DB_NAME', 'pflugera_projectphoenix_db');

// Create database connection
function getDBConnection() {
    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

        if ($conn->connect_error) {
            http_response_code(500);
            // Don't expose error details in production
            die(json_encode(['error' => 'Database connection failed']));
        }

        $conn->set_charset('utf8mb4');
        return $conn;
    } catch (Exception $e) {
        http_response_code(500);
        die(json_encode(['error' => 'Service unavailable']));
    }
}

// CORS headers - UPDATE TO YOUR DOMAIN!
$allowed_origins = [
    'https://phoenix.pflugerarchitects.com',
    'https://www.pflugerarchitects.com',
    'http://localhost:5173', // Remove this in production
    'http://localhost:3000'  // Remove this in production
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>