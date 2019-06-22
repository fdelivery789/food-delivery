<?php
include 'db.php';
$userId = $_POST["id"];
$name = $_POST["name"];
$phone = $_POST["phone"];
$password = $_POST["password"];
$profilePictureSet = intval($_POST["profile_picture_set"]);
$profilePictureURL = $_POST["profile_picture_url"];
$c->query("UPDATE users SET phone='" . $phone . "', password='" . $password . "', name='" . $name . "', profile_picture_url='" . $profilePictureURL . "' WHERE id='" . $userId . "'");
echo 0;