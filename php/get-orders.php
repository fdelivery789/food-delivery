<?php
include 'db.php';
$results = $c->query("SELECT * FROM orders");
$orders = [];
if ($results && $results->num_rows > 0) {
    while ($row = $results->fetch_assoc()) {
        array_push($orders, $row);
    }
}
echo json_encode($orders);