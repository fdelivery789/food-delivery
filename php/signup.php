<?php
include 'db.php';
$email = $_POST["email"];
$password = $_POST["password"];
$name = $_POST["name"];
$phone = $_POST["phone"];
$results = $c->query("SELECT * FROM users WHERE email='" . $email . "'");
if ($results && $results->num_rows > 0) {
    echo -1;
    return;
}
$c->query("INSERT INTO admins (email, password, name, phone) VALUES ('" . $email . "', '" . $password . "', '" . $name . "', '" . $phone . "')");
$userID = mysqli_insert_id($c);
echo $userID;