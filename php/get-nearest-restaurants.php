<?php
include 'db.php';
$latitude = $_POST["latitude"];
$longitude = $_POST["longitude"];
$distance = doubleval($_POST["distance"]);
$results = NULL;
if ($distance == 0) {
	$results = $c->query("SELECT *, SQRT(POW(69.1 * (latitude - " . $latitude . "), 2) + POW(69.1 * (" . $longitude . " - longitude) * COS(latitude / 57.3), 2)) AS distance FROM restaurants ORDER BY distance;");
} else {
	$results = $c->query("SELECT *, SQRT(POW(69.1 * (latitude - " . $latitude . "), 2) + POW(69.1 * (" . $longitude . " - longitude) * COS(latitude / 57.3), 2)) AS distance FROM restaurants HAVING distance < " . $distance . " ORDER BY distance;");
}
$restaurants = [];
if ($results && $results->num_rows > 0) {
	while ($row = $results->fetch_assoc()) {
		array_push($restaurants, $row);
	}
} else {
	$results = $c->query("SELECT * FROM restaurants ORDER BY latitude");
	if ($results && $results->num_rows > 0) {
		while ($row = $results->fetch_assoc()) {
			array_push($restaurants, $row);
		}
	}
}
echo json_encode($restaurants);
