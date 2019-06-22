<?php
include 'db.php';
$message = $_POST["message"];
$adminID = intval($_POST["admin_id"]);
$userID = $_POST["user_id"];
$sender = intval($_POST["sender"]); //1 = admin, 2 = user
$results = $c->query("SELECT * FROM chat_pairs WHERE admin_id=" . $adminID . " AND user_id='" . $userID . "'");
$chatPairID = 0;
if ($results && $results->num_rows > 0) {
	$row = $results->fetch_assoc();
	$chatPairID = $row["id"];
} else {
	$c->query("INSERT INTO chat_pairs (admin_id, user_id) VALUES (" . $adminID . ", '" . $userID . "')");
	$chatPairID = mysqli_insert_id($c);
}
$c->query("INSERT INTO chats (chat_pair_id, message, date, sender) VALUES (" . $chatPairID. ", '" . $message . "', " . round(microtime(true)*1000) . ", " . $sender . ")");
