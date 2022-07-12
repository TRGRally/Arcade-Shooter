<?php
$time = date("H:i:s");
$date = date("Y-m-d");
$db = new PDO("sqlite:usage.db"); //opening sqlite database file
$statement = ("INSERT INTO connections (Time, Date) VALUES (:time, :date)"); //define sql statement
$run = $db->prepare($statement);
$run->bindValue(":time", $time, PDO::PARAM_STR);
$run->bindValue(":date", $date, PDO::PARAM_STR);
$result = $run->execute();
echo "connection established."; 
?>