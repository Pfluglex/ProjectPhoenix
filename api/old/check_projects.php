<?php
// Check all saved projects and their data
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain');

// Database connection
$conn = new mysqli('localhost', 'pflugera_phoenix_user', 'wuptac-7keRqi-gukrur', 'pflugera_projectphoenix_db');

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "=== SAVED PROJECTS CHECK ===\n\n";

// Get all projects
echo "PROJECTS TABLE:\n";
echo "-------------------\n";
$result = $conn->query("SELECT * FROM projects ORDER BY created_at DESC");
if ($result && $result->num_rows > 0) {
    while ($project = $result->fetch_assoc()) {
        echo "Project ID: " . $project['id'] . "\n";
        echo "Name: " . $project['name'] . "\n";
        echo "Space Count: " . $project['space_count'] . "\n";
        echo "Created: " . $project['created_at'] . "\n";
        echo "---\n";

        // Get spaces for this project
        $project_id = $project['id'];
        $spaces_result = $conn->query("SELECT * FROM project_spaces WHERE project_id = '$project_id'");
        if ($spaces_result && $spaces_result->num_rows > 0) {
            echo "  SPACES (" . $spaces_result->num_rows . " total):\n";
            while ($space = $spaces_result->fetch_assoc()) {
                echo "  - " . $space['name'] . " (Level: " . $space['level'] . ", Type: " . $space['type'] . ", Pos: " . $space['position_x'] . "," . $space['position_z'] . ")\n";
            }
        } else {
            echo "  No spaces found\n";
        }

        // Get measurements for this project
        $measurements_result = $conn->query("SELECT * FROM project_measurements WHERE project_id = '$project_id'");
        if ($measurements_result && $measurements_result->num_rows > 0) {
            echo "  MEASUREMENTS (" . $measurements_result->num_rows . " total):\n";
            while ($measurement = $measurements_result->fetch_assoc()) {
                echo "  - ID: " . $measurement['measurement_id'] . " (Level: " . $measurement['level'] . ")\n";
            }
        } else {
            echo "  No measurements found\n";
        }

        echo "\n";
    }
    echo "\nTotal projects: " . $result->num_rows . "\n";
} else {
    echo "No projects found in database\n";
}

// Check space library
echo "\n\nSPACE LIBRARY:\n";
echo "-------------------\n";
$result = $conn->query("SELECT type, COUNT(*) as count FROM space_library GROUP BY type");
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo $row['type'] . ": " . $row['count'] . " spaces\n";
    }
}

$conn->close();
?>