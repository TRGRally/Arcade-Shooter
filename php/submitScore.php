<?php
//only run if both name and score are sent through AJAX
if(isset($_POST["name"]) and isset($_POST["score"])){
    //connect to sqlite database file
    $db = new PDO("sqlite:../db/scores.db") or die("fail to connect db");
    //define statement with placeholder values (protect against SQL inj.)
    $statement = "INSERT INTO Scores (Player, Score) VALUES (:player, :score)";
    $run = $db->prepare($statement);
    //bind name variable to its placeholder
    $run->bindValue(":player", $_POST["name"], PDO::PARAM_STR);
    //bind score variable to its placeholder
    $run->bindValue(":score", $_POST["score"], PDO::PARAM_INT);
    //execute the statement
    $result = $run->execute();
    if ($result){
        echo "The statement executed";
    } else{
        echo "Error with execution";
    }
} else {
    echo "Invalid request";
}
?>