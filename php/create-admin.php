<?php
include 'db.php';
$email = $_POST["email"];
$password = $_POST["password"];
$name = $_POST["name"];
$phone = $_POST["phone"];
$registerDate = intval($_POST["register_date"]);
$accepted = intval($_POST["accepted"]);
$c->query("INSERT INTO admins (id, email, password, name, phone, register_date, accepted) VALUES ('" . uniqid(). "', '" . $email . "', '" . $password . "', '" . $name . "', '" . $phone . "', " . $registerDate . ", " . $accepted . ")");