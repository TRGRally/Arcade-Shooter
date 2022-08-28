<?php
//only run if all stats and UUID are set through AJAX request
if(isset($_POST["highscore"]) and isset($_POST["highwave"]) and isset($_POST["gamesplayed"]) and isset($_POST["shotsfired"]) and isset($_POST["username"])){
    $db = new PDO("sqlite:../db/users.db"); //connect to sqlite database file
    $statement = ("UPDATE Users SET HighScore = :highscore, HighWave = :highwave, GamesPlayed = :gamesplayed, ShotsFired = :shotsfired WHERE Username = :username");
    $run = $db->prepare($statement); //prepare statement
    $run->bindValue(":highscore", $_POST["highscore"], PDO::PARAM_INT); //bind name variable to its placeholder
    $run->bindValue(":highwave", $_POST["highwave"], PDO::PARAM_INT); //bind score variable to its placeholder
    $run->bindValue(":gamesplayed", $_POST["gamesplayed"], PDO::PARAM_INT);
    $run->bindValue(":shotsfired", $_POST["shotsfired"], PDO::PARAM_INT);
    $run->bindValue(":username", $_POST["username"], PDO::PARAM_STR);
    $result = $run->execute(); //execute the statement
}
?>