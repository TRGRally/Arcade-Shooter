<?php
// 1. Check if username and password are set
if(isset($_POST["username"]) and isset($_POST["password"])){
    // 2. Query database for all users
    $db = new PDO("sqlite:../db/users.db");
    $statement = $db->query("SELECT * FROM Users ORDER BY Username DESC");
    $output = $statement->fetchAll(PDO::FETCH_ASSOC); 
    $arrlength = count($output);
    $accExists = false;
    // 3. Loop through users to check if username already exists
    for($x = 0; $x < $arrlength; $x++) {
        if ($output[$x]["Username"] == $_POST["username"]) {
            $accExists = true;
        }
    }

    // 4. Check if username already exists, if not, insert user into database
    if($accExists == false) {
        $statement = ("INSERT INTO Users (Username, Password) VALUES (:username, :password)");
        $run = $db->prepare($statement);
        $run->bindValue(":username", $_POST["username"], PDO::PARAM_STR);
        $run->bindValue(":password", $_POST["password"], PDO::PARAM_STR);
        $result = $run->execute();
    }

    // 5. Return true if account was created, false if account already exists
    echo json_encode(!$accExists);
}
?>