<?php
session_id("fdelivery");
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
$_SESSION["fdelivery_logged_in"] = false;
unset($_SESSION["fdelivery_logged_in"]);
session_destroy();