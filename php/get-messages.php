<?php
include 'db.php';
$adminID = $_POST["admin_id"];
$userID = $_POST["user_id"];
$results = $c->query("SELECT * FROM chat_pairs WHERE admin_id='" . $adminID . "' AND user_id='" . $userID . "'");
$row = $results->fetch_assoc();
$chatPairID = $row["id"];
$messages = [];
$results = $c->query("SELECT * FROM chats WHERE chat_pair_id=" . $chatPairID);
if ($results && $results->num_rows > 0) {
	while ($row = $results->fetch_assoc()) {
		array_push($messages, $row);
	}
}
echo json_encode($messages);
