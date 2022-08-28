<?php
$db = new PDO("sqlite:../db/usage.db"); //opening sqlite database file
$statement = $db->query("SELECT COUNT(*) as total FROM connections"); //define sql statement
$output = $statement->fetchAll(PDO::FETCH_ASSOC); //run sql statement
echo $output["total"];
?>