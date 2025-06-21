<?php

class FriendshipModel
{
    private $db;

    public function __construct()
    {
        // Assumo che esista già una classe Database che gestisce la connessione al DB
        $this->db = new Database();
    }


    public function getFriendList($userID)
    {
        $query = "SELECT
            f.ID AS FriendshipID,
            CASE 
                WHEN f.SenderID = ? THEN u_receiver.Username 
                ELSE u_sender.Username 
            END AS Username,
            CASE 
                WHEN f.SenderID = ? THEN u_receiver.Image 
                ELSE u_sender.Image 
            END AS FriendPicture,
            CASE 
                WHEN f.SenderID = ? THEN u_receiver.UserID
                ELSE u_sender.UserID
            END AS UserID
        FROM FriendShips f
        JOIN Users u_sender ON f.SenderID = u_sender.UserID
        JOIN Users u_receiver ON f.ReceiverID = u_receiver.UserID
        WHERE (f.SenderID = ? OR f.ReceiverID = ?)
          AND f.Status = 'accepted'
    ";


        $stmt = $this->db->query($query, [$userID, $userID, $userID, $userID, $userID]);
        $friendList = $stmt->fetchAll();
        return $friendList;
    }

    public function areFriends($user1, $user2)
    {
        $query = "SELECT * FROM FriendShips
                  WHERE ((SenderID = ? AND ReceiverID =?) OR (SenderID =? AND ReceiverID =?))
                  AND Status = 'accepted'";
        $stmt = $this->db->query($query, [$user1, $user2, $user2, $user1]);
        $isFriend = $stmt->fetch();
        return $isFriend ? true : false;
    }

    public function getFriendshipStatus($user1, $user2)
    {
        $query = "SELECT Status, SenderID, ReceiverID FROM FriendShips
              WHERE ((SenderID = ? AND ReceiverID = ?) OR (SenderID = ? AND ReceiverID = ?))";
        $stmt = $this->db->query($query, [$user1, $user2, $user2, $user1]);
        $friendship = $stmt->fetch();

        if ($friendship) {
            // Se il receiverID corrisponde a $user2 significa che $user1 ha inviato la richiesta ("sended")
            // Altrimenti significa che $user1 l'ha ricevuta ("received")
            $direction = ($friendship['ReceiverID'] == $user1) ? 'sended' : 'received';
            return [
                'Status'    => $friendship['Status'],
                'Direction' => $direction
            ];
        }
        return null;
    }

    public function sendFriendRequest($senderID, $receiverID)
    {
        $query = "INSERT INTO FriendShips (SenderID, ReceiverID, Status)
                  VALUES (?, ?, 'pending')";
        $stmt = $this->db->query($query, [$senderID, $receiverID]);
        return $stmt->rowCount();
    }

    public function removeFriend($userID, $loggedInUserId)
    {
        $query = "DELETE FROM FriendShips
          WHERE (SenderID =? AND ReceiverID =?) OR (SenderID =? AND ReceiverID =?)";
        $stmt = $this->db->query($query, [$userID, $loggedInUserId, $loggedInUserId, $userID]);
        return $stmt->rowCount();
    }

    public function acceptFriendRequest($userID, $loggedInUserId)
    {
        $query = "UPDATE FriendShips SET Status = 'accepted' WHERE SenderID = ? AND ReceiverID = ?";
        $stmt = $this->db->query($query, [$userID, $loggedInUserId]);
        return $stmt->rowCount();
    }

    public function rejectFriendRequest($userID, $loggedInUserId)
    {
        $query = "DELETE FROM FriendShips Where SenderID =? AND ReceiverID =? AND Status = 'pending'";
        $stmt = $this->db->query($query, [$userID, $loggedInUserId]);
        return $stmt->rowCount();
    }

    public function cancelFriendRequest($userID, $loggedInUserId)
    {
        $query = "DELETE FROM FriendShips Where SenderID =? AND ReceiverID =? AND Status = 'pending'";
        $stmt = $this->db->query($query, [$loggedInUserId, $userID]);
        return $stmt->rowCount();
    }
    public function getFriendRequests($userID)
    {
        $query = "SElECT * FROM FriendShips WHERE ReceiverID =? AND Status = 'pending'";
        $stmt = $this->db->query($query, [$userID]);
        $friendRequests = $stmt->fetchAll();
        return $friendRequests;
    }

    public function removeFriendship($userID, $loggedInUserId)
    {
        $query = "DELETE FROM FriendShips
          WHERE (SenderID =? AND ReceiverID =?) OR (SenderID =? AND ReceiverID =?)";
        $stmt = $this->db->query($query, [$userID, $loggedInUserId, $loggedInUserId, $userID]);
        return $stmt->rowCount();
    }
}