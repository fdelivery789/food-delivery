<?php
include 'db.php';
$userID = $_POST["user_id"];
$email = $_POST["email"];
$phone = $_POST["phone"];
$password = $_POST["password"];
$c->query("INSERT INTO users (email, phone, password, firebase_user_id) VALUES ('" . $email . "', '" . $phone . "', '" . $password . "', '" . $userID . "')");
