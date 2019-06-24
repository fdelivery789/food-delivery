<?php
include 'db.php';
$userID = $_POST["user_id"];
$results = $c->query("SELECT * FROM orders WHERE buyer_id='" . $userID . "'");
$orders = [];
if ($results && $results->num_rows > 0) {
	while ($row = $results->fetch_assoc()) {
		array_push($orders, $row);
	}
}
echo json_encode($orders);
