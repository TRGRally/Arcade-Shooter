<?php
function getStats($username) {
    // Connect to the database
    $db = new PDO("sqlite:../db/users.db");
    
    // Create a query to get the user's stats from the database
    $statement = $db->query("SELECT GamesPlayed, ShotsFired, HighScore, HighWave FROM Users WHERE Username = :username");
    
    // Set the username to a parameter to prevent SQL injection
    $statement->bindValue(":username", $username);
    
    // Fetch the results of the query
    $output = $statement->fetchAll(PDO::FETCH_ASSOC);
    
    // Return the results
    return $output;
}

if(isset($_POST["username"])) {
    // Return the results of getStats() in JSON format
    echo json_encode(getStats($_POST["username"]));
}
?>