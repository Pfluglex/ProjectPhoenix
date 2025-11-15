<?php
/**
 * Auth validation helper
 * Include this in other API files to validate authentication
 */

function validateAuth() {
    $headers = getallheaders();

    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(['error' => 'No authorization token provided']);
        exit;
    }

    $authHeader = $headers['Authorization'];

    // Extract token from "Bearer <token>"
    if (strpos($authHeader, 'Bearer ') === 0) {
        $token = substr($authHeader, 7);
    } else {
        $token = $authHeader;
    }

    // Decode and validate token
    try {
        $decoded = json_decode(base64_decode($token), true);

        if (!$decoded || !isset($decoded['expires'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token']);
            exit;
        }

        // Check if expired
        if ($decoded['expires'] < time()) {
            http_response_code(401);
            echo json_encode(['error' => 'Token expired']);
            exit;
        }

        // Token is valid
        return true;

    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
}
?>
