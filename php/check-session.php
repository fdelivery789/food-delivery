<?php
session_id("fdelivery");
session_start();
if (isset($_SESSION["fdelivery_user_id"])) {
	echo 0;
} else {
	echo -1;
}