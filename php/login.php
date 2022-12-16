<?php
//replace passwords with hashes later!!!
if(isset($_POST["username"]) and isset($_POST["password"])){
    $auth = false; // set authentication to false
    //check if user already exsits by querying database
    $db = new PDO("sqlite:../db/users.db"); // create a new PDO object to query the database
    // Get all the users in the database, sorted by username
    $statement = $db->query("SELECT * FROM Users ORDER BY Username DESC"); // query the database for all users
    $output = $statement->fetchAll(PDO::FETCH_ASSOC); // fetch the result of the query
    $arrlength = count($output); // get the number of users in the database
    $accExists = false; // set variable to false
    for($x = 0; $x < $arrlength; $x++) { // loop through all users
        if ($output[$x]["Username"] == $_POST["username"]) { // check if the username entered by the user matches the username of the current user
            $accExists = true; // set variable to true
            if($output[$x]["Password"] == $_POST["password"]) { // check if the password entered by the user matches the password of the current user
                $auth = true; // set authentication to true
            }
        }
    }
    echo json_encode($auth); // return the value of authentication
}
?>