<?php
session_start();
require_once "token.php";
require_once "http_response.php";

spl_autoload_register(function ($class) {
    $baseDir = __DIR__;
    // Elenco di cartelle in cui cercare i file delle classi:
    $possiblePaths = [
        $baseDir,                                      // la cartella principale
        $baseDir . DIRECTORY_SEPARATOR . 'Gateway',    // la cartella "Gateway"
        $baseDir . DIRECTORY_SEPARATOR . 'Model',      // la cartella "Model"
    ];

    foreach ($possiblePaths as $path) {
        // Costruisce il percorso completo a partire dal nome della classe
        $file = $path . DIRECTORY_SEPARATOR . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            return; // una volta trovato il file, si esce dalla funzione
        }
    }
});

$api = str_replace("index.php", "", $_SERVER['SCRIPT_NAME']);

$controller = new Controller;
$controller->set_api($api);
$controller->handle_request();
