<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_config.php';
require_once 'auth_check.php';

// Validate authentication for all requests
validateAuth();

// Get the request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Route to appropriate handler
switch ($action) {
    case 'list':
        listSpaces();
        break;
    case 'get':
        getSpace();
        break;
    case 'create':
        createSpace();
        break;
    case 'update':
        updateSpace();
        break;
    case 'delete':
        deleteSpace();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action. Use: list, get, create, update, or delete']);
        break;
}

/**
 * List all spaces from library
 */
function listSpaces() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }

    $conn = getDBConnection();

    try {
        $stmt = $conn->prepare("SELECT id, name, width, depth, height, type, icon FROM space_library ORDER BY type, name");
        $stmt->execute();
        $result = $stmt->get_result();

        $spaces = [];
        while ($row = $result->fetch_assoc()) {
            // Convert numeric strings to floats
            $row['width'] = (float)$row['width'];
            $row['depth'] = (float)$row['depth'];
            $row['height'] = (float)$row['height'];
            $spaces[] = $row;
        }
        $stmt->close();

        echo json_encode([
            'success' => true,
            'spaces' => $spaces
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }

    $conn->close();
}

/**
 * Get a single space by ID
 */
function getSpace() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }

    $space_id = isset($_GET['id']) ? $_GET['id'] : null;

    if (!$space_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing id parameter']);
        return;
    }

    $conn = getDBConnection();

    try {
        $stmt = $conn->prepare("SELECT id, name, width, depth, height, type, icon FROM space_library WHERE id = ?");
        $stmt->bind_param('s', $space_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Space not found']);
            $conn->close();
            return;
        }

        $space = $result->fetch_assoc();
        $space['width'] = (float)$space['width'];
        $space['depth'] = (float)$space['depth'];
        $space['height'] = (float)$space['height'];
        $stmt->close();

        echo json_encode([
            'success' => true,
            'space' => $space
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }

    $conn->close();
}

/**
 * Create a new space in the library
 */
function createSpace() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON data']);
        return;
    }

    // Validate required fields
    $required = ['id', 'name', 'width', 'depth', 'height', 'type', 'icon'];
    foreach ($required as $field) {
        if (!isset($data[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Missing required field: $field"]);
            return;
        }
    }

    $conn = getDBConnection();

    try {
        $stmt = $conn->prepare("INSERT INTO space_library (id, name, width, depth, height, type, icon) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param(
            'ssdddss',
            $data['id'],
            $data['name'],
            $data['width'],
            $data['depth'],
            $data['height'],
            $data['type'],
            $data['icon']
        );

        if (!$stmt->execute()) {
            throw new Exception('Failed to create space: ' . $stmt->error);
        }
        $stmt->close();

        echo json_encode([
            'success' => true,
            'message' => 'Space created successfully',
            'space_id' => $data['id']
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }

    $conn->close();
}

/**
 * Update an existing space
 */
function updateSpace() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data || !isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid data or missing id']);
        return;
    }

    $conn = getDBConnection();

    try {
        // Build update query dynamically based on provided fields
        $updates = [];
        $types = '';
        $values = [];

        $allowed = ['name', 'width', 'depth', 'height', 'type', 'icon'];
        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                if (in_array($field, ['width', 'depth', 'height'])) {
                    $types .= 'd';
                } else {
                    $types .= 's';
                }
                $values[] = $data[$field];
            }
        }

        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            return;
        }

        $types .= 's'; // for id
        $values[] = $data['id'];

        $sql = "UPDATE space_library SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$values);

        if (!$stmt->execute()) {
            throw new Exception('Failed to update space: ' . $stmt->error);
        }

        if ($stmt->affected_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Space not found']);
            $stmt->close();
            $conn->close();
            return;
        }

        $stmt->close();

        echo json_encode([
            'success' => true,
            'message' => 'Space updated successfully'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }

    $conn->close();
}

/**
 * Delete a space from the library
 */
function deleteSpace() {
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }

    $space_id = null;

    // Check query parameter first
    if (isset($_GET['id'])) {
        $space_id = $_GET['id'];
    } else {
        // Try to get from POST body
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        if ($data && isset($data['id'])) {
            $space_id = $data['id'];
        }
    }

    if (!$space_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing id parameter']);
        return;
    }

    $conn = getDBConnection();

    try {
        $stmt = $conn->prepare("DELETE FROM space_library WHERE id = ?");
        $stmt->bind_param('s', $space_id);

        if (!$stmt->execute()) {
            throw new Exception('Failed to delete space: ' . $stmt->error);
        }

        if ($stmt->affected_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Space not found']);
            $stmt->close();
            $conn->close();
            return;
        }

        $stmt->close();

        echo json_encode([
            'success' => true,
            'message' => 'Space deleted successfully'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }

    $conn->close();
}
?>
