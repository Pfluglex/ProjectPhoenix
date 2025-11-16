<?php
// Database structure check script
require_once 'db_config.php';

$conn = getDBConnection();

$tables = ['projects', 'project_spaces', 'project_measurements', 'space_library'];
$result = [];

foreach ($tables as $table) {
    $sql = "SHOW COLUMNS FROM `$table`";
    $query = $conn->query($sql);

    if ($query) {
        $columns = [];
        while ($row = $query->fetch_assoc()) {
            $columns[] = [
                'field' => $row['Field'],
                'type' => $row['Type'],
                'null' => $row['Null'],
                'default' => $row['Default']
            ];
        }
        $result[$table] = $columns;
    } else {
        $result[$table] = "Table does not exist";
    }
}

header('Content-Type: application/json');
echo json_encode($result, JSON_PRETTY_PRINT);

$conn->close();
?>