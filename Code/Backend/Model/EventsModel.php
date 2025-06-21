<?php

class EventsModel
{
    private $db;

    public function __construct()
    {
        $this->db = new Database();
    }

    public function getPosts(array $filters)
    {
        $type = $filters['tab'] ?? 'forYou';
        $difficulty = $filters['difficulty'] ?? 'all';
        $startDate = $filters['startDate'] ?? null;
        $endDate = $filters['endDate'] ?? null;
        $location = $filters['location'] ?? 'all';
        $offset = $filters['offset'] ?? 0;
        $perPage = $filters['perPage'] ?? 3;
        $userId = $filters['userId'];

        $query = "SELECT e.*, u.Username as CreatorUsername, u.Image AS CreatorImage
                  FROM Events e
                  JOIN Users u ON e.CreatorID = u.UserID
                  WHERE 1=1 ";

        $params = [];        if ($type === 'followed') {
            $query .= " AND e.CreatorID IN (
                            SELECT f.ReceiverID
                            FROM FriendShips f
                            WHERE f.SenderID = ?
                              AND f.Status = 'Accepted'
                            UNION
                            SELECT f.SenderID
                            FROM FriendShips f
                            WHERE f.ReceiverID = ?
                              AND f.Status = 'Accepted'
                        )";
            $params[] = $userId;
            $params[] = $userId;
        } else {
            $query .= " AND (
                            u.Privacy = 0
                            OR e.CreatorID IN (
                                SELECT f.ReceiverID
                                FROM FriendShips f
                                WHERE f.SenderID = ?
                                  AND f.Status = 'Accepted'
                            UNION
                            SELECT f.SenderID
                            FROM FriendShips f
                            WHERE f.ReceiverID = ?
                              AND f.Status = 'Accepted'
                            )
                            OR e.CreatorID = ?
                        )";
            $params[] = $userId;
            $params[] = $userId;
            $params[] = $userId;
        }


        if ($difficulty !== 'all' && $difficulty !== '') {
            $query .= " AND e.Difficulty = ? ";
            $params[] = (int)$difficulty;
        }

        if (!empty($startDate)) {
            $query .= " AND e.DateTime >= ? ";
            $params[] = $startDate;
        }


        if (!empty($endDate)) {
            $query .= " AND e.DateTime <= ? ";
            $params[] = $endDate;
        }

        if ($location !== 'all' && !empty($location)) {
            $query .= " AND e.Location LIKE ?";
            $params[] = "%" . $location . "%";
        }

        $countTotalPosts = $this->db->query($query, $params)->rowCount();

        $query .= " ORDER BY e.DateTime ASC LIMIT ?, ?";
        $params[] = (int)$offset;
        $params[] = (int)$perPage;

        try {
            $stmt = $this->db->query($query, $params);
            $posts = $stmt->fetchAll();
            return [$posts, $countTotalPosts];
        } catch (Exception $e) {
            error_log("Database error in getPosts: " . $e->getMessage());
            return [];
        } finally {
            $this->db->close();
        }
    }

    public function getUserPosts($creatorId)
    {
        $query = "SELECT e.* FROM Events e WHERE e.CreatorID = ? ORDER BY e.DateTime DESC";
        try {
            $stmt = $this->db->query($query, [$creatorId]);
            $posts = $stmt->fetchAll();
            return $posts;
        } catch (Exception $e) {
            error_log("Database error in getUserPosts: " . $e->getMessage());
            return [];
        } finally {
            $this->db->close();
        }
    }

    public function checkIfCreator($userId, $eventId)
    {
        $query = "SELECT CreatorID FROM Events WHERE EventID =?";
        $stmt = $this->db->query($query, [$eventId]);
        return $stmt->fetch()['CreatorID'] == $userId;
    }

    public function checkEventExists($eventId)
    {
        $query = "SELECT * FROM Events WHERE EventID =?";
        $stmt = $this->db->query($query, [$eventId]);
        return $stmt->fetch();
    }

    public function getUserPartecipations($userId)
    {
        $query = "SELECT p.*, e.*
                  FROM Partecipations p
                  JOIN Events e ON p.EventID = e.EventID
                  WHERE p.UserID = ?
                  ORDER BY e.DateTime DESC";
        try {
            $stmt = $this->db->query($query, [$userId]);
            $partecipations = $stmt->fetchAll();
            return $partecipations;
        } catch (Exception $e) {
            error_log("Database error in getUserPartecipations: " . $e->getMessage());
            return [];
        } finally {
            $this->db->close();
        }
    }

    public function getUserPostCount($userId)
    {
        $query = "SELECT COUNT(*) AS total_rows
                    FROM Events
                    WHERE CreatorID = ?";
        $stmt = $this->db->query($query, [$userId]);
        $result = $stmt->fetch();
        return $result['total_rows'];
    }

    public function getEventInfo($eventId)
    {
        $query = "SELECT * FROM Events WHERE EventID =?";
        try {
            $stmt = $this->db->query($query, [$eventId]);
            $event = $stmt->fetch();
            return $event;
        } catch (Exception $e) {
            error_log("Database error in getEventInfo: " . $e->getMessage());
            return [];
        }
    }

    public function createEvent($eventName, $eventDescription, $eventLocation, $eventDateTime, $latitude, $longitude, $creatorID, $eventDifficulty, $imagesJson)
    {
        $query = "INSERT INTO Events
                  (EventName, EventDescription, Location, DateTime, Latitude, Longitude, CreatorID, Difficulty, EventImages)
                  VALUES (?,?,?,?,?,?,?,?,?)";
        $params = [
            $eventName,
            $eventDescription,
            $eventLocation,
            $eventDateTime,
            $latitude,
            $longitude,
            $creatorID,
            $eventDifficulty,
            $imagesJson
        ];
        try {
            $stmt = $this->db->query($query, $params);
            return $stmt->rowCount() > 0;
        } catch (Exception $e) {
            error_log("Database error in createEvent: " . $e->getMessage());
            return [];
        } finally {
            $this->db->close();
        }
    }
    public function updateEvent($eventId, $updates)
    {
        $query = "UPDATE Events SET ";
        $params = [];
        foreach ($updates as $key => $value) {
            // Remove the dot after the column name
            $query .= "$key = ?, ";
            $params[] = $value;
        }

        $query = rtrim($query, ", ");
        $query .= " WHERE EventID = ?";
        $params[] = $eventId;
        $stmt = $this->db->query($query, $params);
        return $stmt->fetchAll();
    }

    public function deleteEvent($eventId)
    {
        $query = "DELETE FROM Events WHERE EventID =?";
        $stmt = $this->db->query($query, [$eventId]);
        return $stmt->fetchAll();
    }
}