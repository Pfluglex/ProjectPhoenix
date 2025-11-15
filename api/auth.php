<?php
/**
 * Simple Authentication API
 * Single user authentication for ProjectPhoenix
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Simple single-user credentials
// NOTE: For production, move these to environment variables
define('AUTH_EMAIL', 'apps@pflugerarchitects.com');
define('AUTH_PASSWORD', '123456');

/**
 * Login endpoint - validates credentials and returns a simple token
 */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Debug logging
    error_log('Auth attempt - Received data: ' . json_encode($data));
    error_log('Expected email: ' . AUTH_EMAIL);
    error_log('Email match: ' . ($data['email'] === AUTH_EMAIL ? 'true' : 'false'));
    error_log('Password match: ' . ($data['password'] === AUTH_PASSWORD ? 'true' : 'false'));

    if (!isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password required']);
        exit;
    }

    // Check credentials
    if ($data['email'] === AUTH_EMAIL && $data['password'] === AUTH_PASSWORD) {
        // Generate a simple session token (just base64 encoded timestamp + email)
        $token = base64_encode(json_encode([
            'email' => AUTH_EMAIL,
            'timestamp' => time(),
            'expires' => time() + (7 * 24 * 60 * 60) // 7 days
        ]));

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => [
                'email' => AUTH_EMAIL
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>
