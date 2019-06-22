<?php
include 'db.php';
$email = $_GET["email"];
$results = $c->query("SELECT * FROM users WHERE email='" . $email . "'");
if ($results && $results->num_rows > 0) {
    $row = $results->fetch_assoc();
    echo json_encode($row);
} else {
    echo -1;
}