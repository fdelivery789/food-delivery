<?php
$fileName = $_POST["file_name"];
move_uploaded_file($_FILES["file"]["tmp_name"], "../userdata/images/" . $fileName);
