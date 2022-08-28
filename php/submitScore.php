<?php
//only run if both name and score are sent through AJAX
if(isset($_POST["name"]) and isset($_POST["score"]) and isset($_POST["timestamp"])){
    $time = date("H:i:s");
    $date = date("Y-m-d");
    $db = new PDO("sqlite:../db/scores.db"); //connect to sqlite database file
    $statement = ("INSERT INTO scores (Player, Score, Time, Date) VALUES (:player, :score, :time, :date)"); //define statement with placeholder values (protect against SQL inj.)
    $run = $db->prepare($statement); //prepare statement
    $run->bindValue(":player", $_POST["name"], PDO::PARAM_STR); //bind name variable to its placeholder
    $run->bindValue(":score", $_POST["score"], PDO::PARAM_INT); //bind score variable to its placeholder
    $run->bindValue(":time", $time, PDO::PARAM_STR);
    $run->bindValue(":date", $date, PDO::PARAM_STR);
    $result = $run->execute(); //execute the statement
}
?>