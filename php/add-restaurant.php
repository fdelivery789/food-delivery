<?php
include 'db.php';
$id = $_POST["id"];
$name = $_POST["name"];
$imgURL = $_POST["img_url"];
$latitude = doubleval($_POST["latitude"]);
$longitude = doubleval($_POST["longitude"]);
$address = $_POST["address"];
$rating = $_POST["rating"];
$c->query("INSERT INTO restaurants (id, name, img_url, latitude, longitude, address, rating) VALUES ('" . $id . "', '" . $name . "', '" . $imgURL . "', " . $latitude . ", " . $longitude . ", '" . $address . "', '" . $rating . "')");
