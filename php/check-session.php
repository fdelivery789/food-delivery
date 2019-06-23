<?php
session_id("fdelivery");
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
if (isset($_SESSION["fdelivery_logged_in"]) && $_SESSION["fdelivery_logged_in"] == true) {
	echo 0;
} else {
	echo -1;
}