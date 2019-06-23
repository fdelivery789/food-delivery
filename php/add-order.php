<?php
include 'db.php';
$buyerAddress = $_POST["buyer_address"];
$buyerID = $_POST["buyer_id"];
$fee = intval($_POST["fee"]);
$restaurantID = $_POST["restaurant_id"];
$sellerID = $_POST["seller_id"];
$driverID = $_POST["driver_id"];
$totalItems = intval($_POST["total_items"]);
$totalPrice = intval($_POST["total_price"]);
$c->query("INSERT INTO orders (buyer_address, buyer_id, fee, restaurant_id, seller_id, driver_id, total_items, total_price) VALUES ('" . $buyerAddress . "', '" . $buyerID . "', " . $fee . ", '" . $restaurantID . "', '" . $sellerID . "', '" . $driverID . "', " . $totalItems . ", " . $totalPrice . ")");
$orderID = mysqli_insert_id($c);
echo $orderID;
