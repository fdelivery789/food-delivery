<?php
include 'db.php';
$driverID = $_POST["user_id"];
$results = $c->query("SELECT * FROM orders WHERE driver_id='" . $driverID . "'");
$orders = [];
if ($results && $results->num_rows > 0) {
    while ($row = $results->fetch_assoc()) {
        array_push($orders, $row);
    }
}
echo json_encode($orders);
