<?php
$settings = $_POST["content"];
file_put_contents("../systemdata/settings.json", $settings);