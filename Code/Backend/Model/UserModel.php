<?php
class UserModel
{
    private $db;

    public function __construct()
    {
        $this->db = new Database(); // Assumo che Database sia una classe esistente
    }

    public function getUserByID($userId)
    {
        return $this->db->query("SELECT * FROM Users WHERE UserID =?", [$userId])->fetch();
    }

    public function getUserByEmail($email)
    {
        return  $this->db->query("SELECT * FROM Users WHERE Email = ?", [$email])->fetch();
    }

    public function getUserByUsername($username)
    {
        return  $this->db->query("SELECT * FROM Users WHERE Username =?", [$username])->fetch();
    }

    public function updateUser($userId, $updates)
    {
        $query = "UPDATE Users SET ";
        $params = [];

        foreach ($updates as $field => $value) {
            $query .= "$field = ?, ";
            $params[] = $value;
        }

        // Remove trailing comma and space
        $query = rtrim($query, ", ");
        $query .= " WHERE UserID = ?";
        $params[] = $userId;

        // Execute the query and return the result
        $this->db->query($query, $params);
        return $this->db->query("SELECT * FROM Users WHERE UserID =?", [$userId])->fetch(); // Fetch the updated user after the update
    }

    public function createAccount($data)
    {
        $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);

        $query = "INSERT INTO Users (Username, Email, PasswordHash, Name, Surname, Privacy, Image) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $params = [
            $data['username'],
            $data['email'],
            $passwordHash,
            $data['name'],
            $data['surname'],
            $data['privacy'],
            $data['image']
        ];
        $stmt = $this->db->query($query, $params);
        return $this->db->query("SELECT LAST_INSERT_ID()")->fetchColumn(); // Return the auto-generated UserID from the database
    }
    public function searchUsers($searchTerm)
    {
        $query = "
            SELECT *
            FROM Users
            WHERE Username LIKE ?
            ORDER BY 
              CASE 
                WHEN Username = ? THEN 1 
                WHEN Username LIKE ? THEN 2 
                ELSE 3 
              END
        ";
        $params = ["%$searchTerm%", $searchTerm, "%$searchTerm%"];
        $stmt   = $this->db->query($query, $params);
        return $stmt->fetchAll();
    }
}
