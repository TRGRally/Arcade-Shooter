<?php
//
//replace passwords with hashes later!!!
//
if(isset($_POST["username"]) and isset($_POST["password"])){
    $auth = false;
    //check if user already exsits by querying database
    $db = new PDO("sqlite:../db/users.db");
    $statement = $db->query("SELECT * FROM Users ORDER BY Username DESC");
    $output = $statement->fetchAll(PDO::FETCH_ASSOC); 
    $arrlength = count($output);
    $accExists = false;
    for($x = 0; $x < $arrlength; $x++) {
        if ($output[$x]["Username"] == $_POST["username"]) {
            $accExists = true;
            if($output[$x]["Password"] == $_POST["password"]) {
                $auth = true;
            }
        }
    }
    echo json_encode($auth);
}

?>