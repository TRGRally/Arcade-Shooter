<?php
$time = date("H:i:s");
$date = date("Y-m-d");
$ip = $_SERVER["REMOTE_ADDR"];
$db = new PDO("sqlite:../db/usage.db"); //opening sqlite database file
$statement = ("INSERT INTO connections (Time, Date, IP) VALUES (:time, :date, :ip)");
$run = $db->prepare($statement);
$run->bindValue(":time", $time, PDO::PARAM_STR);
$run->bindValue(":date", $date, PDO::PARAM_STR);
$run->bindValue(":ip", $ip, PDO::PARAM_STR);
$result = $run->execute();
echo "connection established."; 
?>