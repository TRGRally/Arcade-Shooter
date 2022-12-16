<?php
// Create variables for the time, date, and IP address
$time = date("H:i:s");
$date = date("Y-m-d");
$ip = $_SERVER["REMOTE_ADDR"];

// Open the SQLite database file
try {
    $db = new PDO("sqlite:../db/usage.db");
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
    exit;
}

// Create an SQL statement to insert the time, date, and IP address
// into the connections table
$statement = ("INSERT INTO connections (Time, Date, IP) VALUES (:time, :date, :ip)");

// Prepare the SQL statement
try {
    $run = $db->prepare($statement);
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
    exit;
}

// Bind values to the SQL statement
try {
    $run->bindValue(":time", $time, PDO::PARAM_STR);
    $run->bindValue(":date", $date, PDO::PARAM_STR);
    $run->bindValue(":ip", $ip, PDO::PARAM_STR);
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
    exit;
}

// Execute the SQL statement
try {
    $result = $run->execute();
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
    exit;
}

// Print a message to the browser
echo "connection established."; 
?>