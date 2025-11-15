<?php
require_once 'db_config.php';

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
    case 'delete':
        deleteProject();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action. Use: list, load, save, or delete']);
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
        $stmt = $conn->prepare("SELECT project_id, space_instance_id, template_id, space_id as id, name, width, depth, height, icon, type, position_x, position_y, position_z, rotation FROM project_spaces WHERE project_id = ?");
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

            $spaces[] = $row;
        }
        $stmt->close();

        echo json_encode([
            'success' => true,
            'project' => $project,
            'spaces' => $spaces
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }

    $conn->close();
}

/**
 * Save a new project with its spaces
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
        // Insert project
        $stmt = $conn->prepare("INSERT INTO projects (id, name, timestamp, space_count) VALUES (?, ?, ?, ?)");
        $stmt->bind_param('sssi', $project['id'], $project['name'], $project['timestamp'], $project['spaceCount']);

        if (!$stmt->execute()) {
            throw new Exception('Failed to insert project: ' . $stmt->error);
        }
        $stmt->close();

        // Insert spaces
        if (!empty($spaces)) {
            $stmt = $conn->prepare("INSERT INTO project_spaces (project_id, space_instance_id, template_id, space_id, name, width, depth, height, icon, type, position_x, position_y, position_z, rotation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

            foreach ($spaces as $space) {
                $stmt->bind_param(
                    'sssssdddssdddd',
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
                    $space['rotation']
                );

                if (!$stmt->execute()) {
                    throw new Exception('Failed to insert space: ' . $stmt->error);
                }
            }
            $stmt->close();
        }

        // Commit transaction
        $conn->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Project saved successfully',
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
        // First, delete all spaces associated with this project
        $stmt = $conn->prepare("DELETE FROM project_spaces WHERE project_id = ?");
        $stmt->bind_param('s', $project_id);

        if (!$stmt->execute()) {
            throw new Exception('Failed to delete project spaces: ' . $stmt->error);
        }
        $stmt->close();

        // Then, delete the project itself
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
?>
