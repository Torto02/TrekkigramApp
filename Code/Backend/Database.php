<?php

class Database
{
    private $host;
    private $username;
    private $password;
    private $dbname;
    private $connection;

    public function __construct()
    {
        $this->host = getenv('MYSQL_HOST');
        $this->username = getenv('MYSQL_USER');
        $this->password = getenv('MYSQL_PASSWORD');
        $this->dbname = getenv('MYSQL_DATABASE');

        $this->connect();
    }

    private function connect()
    {
        $dsn = "mysql:host={$this->host};dbname={$this->dbname};charset=utf8mb4";

        try {
            $this->connection = new PDO($dsn, $this->username, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,  // Errori sollevati come eccezioni
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, // Array associativi come fetch di default
                PDO::ATTR_EMULATE_PREPARES => false // Disabilita l'emulazione per maggiore sicurezza
            ]);
        } catch (PDOException $e) {
            respond(500, false, "Errore di connessione al database: " . $e->getMessage());
        }
    }

    public function query($sql, $params = []): bool|PDOStatement
    {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    public function close()
    {
        $this->connection = null;
    }
}
