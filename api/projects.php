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
        listProjects();
        break;
    case 'load':
        loadProject();
        break;
    case 'save':
        saveProject();
        break;
    case 'update':
        updateProject();
        break;
    case 'delete':
        deleteProject();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action. Use: list, load, save, update, or delete']);
        break;
}

/**
 * List all projects
 */
function listProjects() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }

    $conn = getDBConnection();

    try {
        $stmt = $conn->prepare("SELECT id, name, timestamp, space_count FROM projects ORDER BY timestamp DESC");
        $stmt->execute();
        $result = $stmt->get_result();

        $projects = [];
        while ($row = $result->fetch_assoc()) {
            $row['space_count'] = (int)$row['space_count'];
            $projects[] = $row;
        }
        $stmt->close();

        echo json_encode([
            'success' => true,
            'projects' => $projects
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }

    $conn->close();
}

/**
 * Load a single project with its spaces
 */
function loadProject() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }

    $project_id = isset($_GET['project_id']) ? $_GET['project_id'] : null;

    if (!$project_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing project_id parameter']);
        return;
    }

    $conn = getDBConnection();

    try {
        // Get project details
        $stmt = $conn->prepare("SELECT id, name, timestamp, space_count FROM projects WHERE id = ?");
        $stmt->bind_param('s', $project_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Project not found']);
            $conn->close();
            return;
        }

        $project = $result->fetch_assoc();
        $stmt->close();

        // Get project spaces
        $stmt = $conn->prepare("SELECT project_id, space_instance_id, template_id, space_id as id, name, width, depth, height, icon, type, position_x, position_y, position_z, rotation, level FROM project_spaces WHERE project_id = ?");
        $stmt->bind_param('s', $project_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $spaces = [];
        while ($row = $result->fetch_assoc()) {
            // Convert string numbers to floats
            $row['width'] = (float)$row['width'];
            $row['depth'] = (float)$row['depth'];
            $row['height'] = (float)$row['height'];
            $row['position_x'] = (float)$row['position_x'];
            $row['position_y'] = (float)$row['position_y'];
            $row['position_z'] = (float)$row['position_z'];
            $row['rotation'] = (float)$row['rotation'];
            $row['level'] = (int)$row['level'];

            $spaces[] = $row;
        }
        $stmt->close();

        // Get project measurements
        $stmt = $conn->prepare("SELECT measurement_id as id, point1_x, point1_z, point2_x, point2_z, level FROM project_measurements WHERE project_id = ?");
        $stmt->bind_param('s', $project_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $measurements = [];
        while ($row = $result->fetch_assoc()) {
            $measurements[] = [
                'id' => $row['id'],
                'point1' => [
                    'x' => (float)$row['point1_x'],
                    'z' => (float)$row['point1_z']
                ],
                'point2' => [
                    'x' => (float)$row['point2_x'],
                    'z' => (float)$row['point2_z']
                ],
                'level' => (int)$row['level']
            ];
        }
        $stmt->close();

        echo json_encode([
            'success' => true,
            'project' => $project,
            'spaces' => $spaces,
            'measurements' => $measurements
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }

    $conn->close();
}

/**
 * Save or Update a project
 */
function saveProject() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }

    // Get JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON data']);
        return;
    }

    // Validate required fields
    if (!isset($data['project']) || !isset($data['spaces'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing project or spaces data']);
        return;
    }

    $project = $data['project'];
    $spaces = $data['spaces'];
    $measurements = isset($data['measurements']) ? $data['measurements'] : [];

    // Validate project fields
    if (!isset($project['id']) || !isset($project['name']) || !isset($project['timestamp']) || !isset($project['spaceCount'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required project fields']);
        return;
    }

    $conn = getDBConnection();

    // Start transaction
    $conn->begin_transaction();

    try {
        // Check if project exists
        $stmt = $conn->prepare("SELECT id FROM projects WHERE id = ?");
        $stmt->bind_param('s', $project['id']);
        $stmt->execute();
        $result = $stmt->get_result();
        $projectExists = $result->num_rows > 0;
        $stmt->close();

        if ($projectExists) {
            // UPDATE existing project
            $stmt = $conn->prepare("UPDATE projects SET name = ?, timestamp = ?, space_count = ? WHERE id = ?");
            $stmt->bind_param('ssis', $project['name'], $project['timestamp'], $project['spaceCount'], $project['id']);

            if (!$stmt->execute()) {
                throw new Exception('Failed to update project: ' . $stmt->error);
            }
            $stmt->close();

            // Delete old spaces and measurements
            $stmt = $conn->prepare("DELETE FROM project_spaces WHERE project_id = ?");
            $stmt->bind_param('s', $project['id']);
            $stmt->execute();
            $stmt->close();

            $stmt = $conn->prepare("DELETE FROM project_measurements WHERE project_id = ?");
            $stmt->bind_param('s', $project['id']);
            $stmt->execute();
            $stmt->close();
        } else {
            // INSERT new project
            $stmt = $conn->prepare("INSERT INTO projects (id, name, timestamp, space_count) VALUES (?, ?, ?, ?)");
            $stmt->bind_param('sssi', $project['id'], $project['name'], $project['timestamp'], $project['spaceCount']);

            if (!$stmt->execute()) {
                throw new Exception('Failed to insert project: ' . $stmt->error);
            }
            $stmt->close();
        }

        // Insert spaces
        if (!empty($spaces)) {
            $stmt = $conn->prepare("INSERT INTO project_spaces (project_id, space_instance_id, template_id, space_id, name, width, depth, height, icon, type, position_x, position_y, position_z, rotation, level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

            foreach ($spaces as $space) {
                $level = isset($space['level']) ? $space['level'] : 1;

                $stmt->bind_param(
                    'sssssdddssddddi',
                    $space['project_id'],
                    $space['space_instance_id'],
                    $space['template_id'],
                    $space['id'],
                    $space['name'],
                    $space['width'],
                    $space['depth'],
                    $space['height'],
                    $space['icon'],
                    $space['type'],
                    $space['position_x'],
                    $space['position_y'],
                    $space['position_z'],
                    $space['rotation'],
                    $level
                );

                if (!$stmt->execute()) {
                    throw new Exception('Failed to insert space: ' . $stmt->error);
                }
            }
            $stmt->close();
        }

        // Insert measurements
        if (!empty($measurements)) {
            $stmt = $conn->prepare("INSERT INTO project_measurements (project_id, measurement_id, point1_x, point1_z, point2_x, point2_z, level) VALUES (?, ?, ?, ?, ?, ?, ?)");

            foreach ($measurements as $measurement) {
                $level = isset($measurement['level']) ? $measurement['level'] : 1;

                $stmt->bind_param(
                    'ssddddi',
                    $project['id'],
                    $measurement['id'],
                    $measurement['point1']['x'],
                    $measurement['point1']['z'],
                    $measurement['point2']['x'],
                    $measurement['point2']['z'],
                    $level
                );

                if (!$stmt->execute()) {
                    throw new Exception('Failed to insert measurement: ' . $stmt->error);
                }
            }
            $stmt->close();
        }

        // Commit transaction
        $conn->commit();

        echo json_encode([
            'success' => true,
            'message' => $projectExists ? 'Project updated successfully' : 'Project saved successfully',
            'project_id' => $project['id']
        ]);

    } catch (Exception $e) {
        // Rollback on error
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }

    $conn->close();
}

/**
 * Delete a project and all its spaces
 */
function deleteProject() {
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }

    $project_id = isset($_GET['project_id']) ? $_GET['project_id'] : null;

    if (!$project_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing project_id parameter']);
        return;
    }

    $conn = getDBConnection();

    // Start transaction
    $conn->begin_transaction();

    try {
        // Delete measurements first
        $stmt = $conn->prepare("DELETE FROM project_measurements WHERE project_id = ?");
        $stmt->bind_param('s', $project_id);
        $stmt->execute();
        $stmt->close();

        // Delete spaces
        $stmt = $conn->prepare("DELETE FROM project_spaces WHERE project_id = ?");
        $stmt->bind_param('s', $project_id);
        $stmt->execute();
        $stmt->close();

        // Delete the project itself
        $stmt = $conn->prepare("DELETE FROM projects WHERE id = ?");
        $stmt->bind_param('s', $project_id);

        if (!$stmt->execute()) {
            throw new Exception('Failed to delete project: ' . $stmt->error);
        }

        $affectedRows = $stmt->affected_rows;
        $stmt->close();

        if ($affectedRows === 0) {
            throw new Exception('Project not found');
        }

        // Commit transaction
        $conn->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Project deleted successfully'
        ]);

    } catch (Exception $e) {
        // Rollback on error
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }

    $conn->close();
}

// Alias for backwards compatibility
function updateProject() {
    saveProject();
}
?>