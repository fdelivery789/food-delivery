<?php
$channelData = $_POST["channel_data"];
file_put_contents("../channels.m3u", $channelData);