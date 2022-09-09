<?php

if(isset($_POST["username"]) and isset($_POST["password"])){
    //check if user already exsits by querying database
    $db = new PDO("sqlite:../db/users.db");
    $statement = $db->query("SELECT * FROM Users ORDER BY Username DESC");
    $output = $statement->fetchAll(PDO::FETCH_ASSOC); 
    $arrlength = count($output);
    $accExists = false;
    for($x = 0; $x < $arrlength; $x++) {
        if ($output[$x]["Username"] == $_POST["username"]) {
            $accExists = true;
        }
    }

    if($accExists == false) {
        $statement = ("INSERT INTO Users (Username, Password) VALUES (:username, :password)");
        $run = $db->prepare($statement);
        $run->bindValue(":username", $_POST["username"], PDO::PARAM_STR);
        $run->bindValue(":password", $_POST["password"], PDO::PARAM_STR);
        $result = $run->execute();
    }

    echo json_encode(!$accExists);
}

?>