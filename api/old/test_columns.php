<?php
// Quick database column check
// Upload this to your server and access it in browser

header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain');

// Database connection
$conn = new mysqli('localhost', 'pflugera_phoenix_user', 'wuptac-7keRqi-gukrur', 'pflugera_projectphoenix_db');

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "=== DATABASE STRUCTURE CHECK ===\n\n";

// Check project_spaces columns
echo "TABLE: project_spaces\n";
echo "-------------------\n";
$result = $conn->query("SHOW COLUMNS FROM project_spaces");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        echo $row['Field'] . " (" . $row['Type'] . ")\n";
    }
} else {
    echo "Table does not exist or error: " . $conn->error . "\n";
}

echo "\n\nTABLE: projects\n";
echo "-------------------\n";
$result = $conn->query("SHOW COLUMNS FROM projects");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        echo $row['Field'] . " (" . $row['Type'] . ")\n";
    }
} else {
    echo "Table does not exist or error: " . $conn->error . "\n";
}

echo "\n\nTABLE: project_measurements\n";
echo "-------------------\n";
$result = $conn->query("SHOW COLUMNS FROM project_measurements");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        echo $row['Field'] . " (" . $row['Type'] . ")\n";
    }
} else {
    echo "Table does not exist or error: " . $conn->error . "\n";
}

echo "\n\nTABLE: space_library\n";
echo "-------------------\n";
$result = $conn->query("SHOW COLUMNS FROM space_library");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        echo $row['Field'] . " (" . $row['Type'] . ")\n";
    }
} else {
    echo "Table does not exist or error: " . $conn->error . "\n";
}

$conn->close();
?>