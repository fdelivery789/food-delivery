<?php
session_id("jossstream");
session_start();
unset($_SESSION["jossstream_user_id"]);
session_destroy();