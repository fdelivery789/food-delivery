<?php
include 'db.php';
$adminId = $_GET["id"];
$c->query("DELETE FROM admins WHERE id='" . $adminId . "'");