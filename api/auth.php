<?php
/**
 * Authentication API for ProjectPhoenix
 * IMPORTANT: Update password hash before deploying!
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

// Authentication credentials
define('AUTH_EMAIL', 'apps@pflugerarchitects.com');

// IMPORTANT: Generate a new password hash before deploying!
// Run: php -r "echo password_hash('your_secure_password', PASSWORD_DEFAULT);"
// Then replace the hash below:
define('AUTH_PASSWORD_HASH', '$2y$10$CHANGE_THIS_HASH_BEFORE_DEPLOYMENT');

// For development only - remove in production
define('DEV_PASSWORD', '123456'); // REMOVE THIS LINE IN PRODUCTION!

/**
 * Login endpoint
 */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password required']);
        exit;
    }

    // Check credentials
    $validLogin = false;

    // Check production password (once hash is set)
    if (strpos(AUTH_PASSWORD_HASH, 'CHANGE_THIS') === false) {
        $validLogin = ($data['email'] === AUTH_EMAIL && password_verify($data['password'], AUTH_PASSWORD_HASH));
    } else {
        // Development fallback - REMOVE IN PRODUCTION
        $validLogin = ($data['email'] === AUTH_EMAIL && $data['password'] === DEV_PASSWORD);
    }

    if ($validLogin) {
        // Generate token
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