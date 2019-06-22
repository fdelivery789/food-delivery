<?php
include 'db.php';
$results = $c->query("SELECT * FROM admins");
$admins = [];
if ($results && $results->num_rows > 0) {
    while ($row = $results->fetch_assoc()) {
        array_push($admins, $row);
    }
}
echo json_encode($admins);