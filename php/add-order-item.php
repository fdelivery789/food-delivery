<?php
include 'db.php';
$orderID = intval($_POST["order_id"]);
$name = $_POST["name"];
$price = intval($_POST["price"]);
$imgURL = $_POST["img_url"];
$count = intval($_POST["count"]);
$description = $_POST["description"];
$c->query("INSERT INTO order_items (order_id, name, price, img_url, count, description) VALUES (" . $orderID . ", '" . $name . "', " . $price . ", '" . $imgURL . "', " . $count . ", '" . $description . "')");
