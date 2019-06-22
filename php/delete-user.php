<?php
include 'db.php';
$id = $_GET["id"];
$c->query("DELETE FROM users WHERE id='" . $id . "'");