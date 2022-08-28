<?php
$db = new PDO("sqlite:../db/users.db"); //opening sqlite database file
$statement = $db->query("SELECT GamesPlayed, ShotsFired, HighScore, HighWave FROM Users WHERE Username = :username"); //define sql statement
$output = $statement->fetchAll(PDO::FETCH_ASSOC); //run sql statement
echo json_encode($output); //encode result into JSON and send back
?>