<?php
include 'db.php';
$userID = $_POST["user_id"];
$password = $_POST["password"];
$c->query("UPDATE users SET password='" . $password . "' WHERE firebase_user_id='" . $userID . "'");
