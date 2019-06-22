<?php
session_id("fdelivery");
session_start();
$adminID = $_SESSION["fdelivery_user_id"];
echo $adminID;