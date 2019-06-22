<?php
include 'db.php';
$results = $c->query("SELECT * FROM orders");
$purchases = [];
if ($results && $results->num_rows > 0) {
    while ($row = $results->fetch_assoc()) {
        array_push($purchases, $row);
    }
}
echo json_encode($purchases);