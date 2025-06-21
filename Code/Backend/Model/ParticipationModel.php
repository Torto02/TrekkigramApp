<?php

class ParticipationModel
{
    private $db;

    public function __construct()
    {

        $this->db = new Database();
    }


    public function checkIfSubscribed($eventID, $userID)
    {
        $query = "SELECT Status, InvitedBy FROM Partecipations WHERE EventID = ? AND UserID = ?";
        $stmt = $this->db->query($query, [$eventID, $userID]);
        $result = $stmt->fetch();
        return $result;
    }

    public function clearInvitations($userID, $eventID)
    {
        $query = "DELETE FROM Partecipations WHERE EventID =? AND UserID =? AND Status = 'pending'";
        $stmt = $this->db->query($query, [$eventID, $userID]);
        return $stmt;
    }

    public function addPartecipation($userID, $eventID)
    {
        $query = "INSERT INTO Partecipations (UserID, EventID, Status, JoinedAt) VALUES (?, ?, 'participate', NOW())";
        $stmt = $this->db->query($query, [$userID, $eventID]);
        return $stmt;
    }

    public function deletePartecipation($userId, $eventId)
    {
        $query = "DELETE FROM Partecipations WHERE UserID =? AND EventID =?";
        $stmt = $this->db->query($query, [$userId, $eventId]);
        return $stmt;
    }

    public function getPartecipantsByEvent($eventId)
    {
        $query = "SELECT u.UserID, u.Username, u.Image
                FROM Users u
                INNER JOIN Partecipations p ON u.UserID = p.UserID
                WHERE p.EventID = ? AND p.Status = 'participate'";
        $stmt = $this->db->query($query, [$eventId]);
        $result = $stmt->fetchAll();
        return $result;
    }

    public function sendInvitation($senderID, $receiverID, $eventId)
    {
        $query = "INSERT INTO Partecipations (UserID, EventID, Status, JoinedAt, InvitedBy) VALUES (?, ?, 'pending', NOW(), ?)";
        $stmt = $this->db->query($query, [$receiverID, $eventId, $senderID]);
        return $stmt;
    }

    public function getEventInvitations($receiverID)
    {
        $query = "SELECT * FROM Partecipations WHERE UserID =? AND Status = 'pending'";
        $stmt = $this->db->query($query, [$receiverID]);
        $result = $stmt->fetchAll();
        return $result;
    }

    public function acceptInvitation($receiverID, $ID)
    {
        $query = "UPDATE Partecipations SET Status = 'participate' WHERE UserID =? AND ID =?";
        $stmt = $this->db->query($query, [$receiverID, $ID]);
        return $stmt;
    }

    public function rejectInvitation($receiverID, $ID)
    {
        $query = "DELETE FROM Partecipations WHERE UserID =? AND ID =?";
        $stmt = $this->db->query($query, [$receiverID, $ID]);
        return $stmt;
    }
}
