<?php
include 'db.php';
$userID = $_POST["user_id"];
$results = $c->query("SELECT * FROM users WHERE firebase_user_id='" . $userID . "'");
if ($results && $results->num_rows > 0) {
    $row = $results->fetch_assoc();
    echo json_encode($row);
} else {
    echo -1;
}
