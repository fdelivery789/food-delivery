<?php
include 'db.php';
$orderID = intval($_POST["order_id"]);
$results = $c->query("SELECT * FROM order_items WHERE order_id=" . $orderID);
$orderItems = [];
if ($results && $results->num_rows > 0) {
	while ($row = $results->fetch_assoc()) {
		array_push($orderItems, $row);
	}
}
echo json_encode($orderItems);
