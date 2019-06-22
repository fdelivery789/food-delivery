<?php
include 'db.php';
$id = $_POST["id"];
$name = $_POST["name"];
$imgURL = $_POST["img_url"];
$latitude = doubleval($_POST["latitude"]);
$longitude = doubleval($_POST["longitude"]);
$address = $_POST["address"];
$rating = $_POST["rating"];
$sellerID = $_POST["seller_id"];
$c->query("INSERT INTO restaurants (id, name, img_url, latitude, longitude, address, rating, seller_id) VALUES ('" . $id . "', '" . $name . "', '" . $imgURL . "', " . $latitude . ", " . $longitude . ", '" . $address . "', '" . $rating . "', '" . $sellerID . "')");
