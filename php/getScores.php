<?php
$db = new PDO("sqlite:../db/scores.db"); //opening sqlite database file
$statement = $db->query("SELECT * FROM scores ORDER BY Score DESC"); //define sql statement
$output = $statement->fetchAll(PDO::FETCH_ASSOC); //run sql statement
echo json_encode($output); //encode result into JSON and send back
?>