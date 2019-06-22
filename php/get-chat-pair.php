<?php
include 'db.php';
$chatPairID = intval($_POST["chat_pair_id"]);
$results = $c->query("SELECT * FROM chat_pairs WHERE id=" . $chatPairID);
if ($results && $results->num_rows > 0) {
	$row = $results->fetch_assoc();
	echo json_encode($row);
} else {
	echo "";
}
