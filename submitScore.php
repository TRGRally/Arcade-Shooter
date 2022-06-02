<?php
//only run if both name and score are sent through AJAX
if(isset($_POST["name"]) and isset($_POST["score"])){
    $db = new PDO("sqlite:scores.db"); //connect to sqlite database file
    $statement = ("INSERT INTO scores (Player, Score) VALUES (:player, :score)"); //define statement with placeholder values (protect against SQL inj.)
    $run = $db->prepare($statement); //prepare statement
    $run->bindValue(":player", $_POST["name"], PDO::PARAM_STR); //bind name variable to its placeholder
    $run->bindValue(":score", $_POST["score"], PDO::PARAM_INT); //bind score variable to its placeholder
    $result = $run->execute(); //execute the statement
}
?>