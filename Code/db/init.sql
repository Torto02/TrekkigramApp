CREATE DATABASE IF NOT EXISTS TrekkigramDB;
USE TrekkigramDB;

CREATE TABLE IF NOT EXISTS Users (
  UserID INT AUTO_INCREMENT PRIMARY KEY,
  Username VARCHAR(50) NOT NULL UNIQUE,
  Email VARCHAR(100) NOT NULL UNIQUE,
  PasswordHash VARCHAR(255) NOT NULL,
  Name VARCHAR(50) NOT NULL,
  Surname VARCHAR(50) NOT NULL,
  Image JSON DEFAULT NULL,
  Privacy TINYINT(1) DEFAULT 0,
  Description TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS Events (
  EventID INT AUTO_INCREMENT PRIMARY KEY,
  EventName VARCHAR(100) NOT NULL,
  EventDescription TEXT,
  Location VARCHAR(100),
  DateTime DATETIME DEFAULT NULL,
  CreatorID INT NOT NULL,
  Difficulty INT NOT NULL,
  Latitude DECIMAL(9,6),
  Longitude DECIMAL(9,6),
  EventImages JSON DEFAULT NULL,
  FOREIGN KEY (CreatorID) REFERENCES Users(UserID)
);


CREATE TABLE IF NOT EXISTS Partecipations (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    EventID INT NOT NULL,
    InvitedBy INT NULL, -- NULL se l'utente si è iscritto da solo
    Status ENUM('participate', 'pending') NOT NULL DEFAULT 'pending',
    JoinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (InvitedBy) REFERENCES Users(UserID) ON DELETE SET NULL,
    FOREIGN KEY (EventID) REFERENCES Events(EventID) ON DELETE CASCADE,
    CONSTRAINT UNIQUE (UserID, EventID) -- Impedisce più righe con lo stesso UserID e EventID
);

CREATE TABLE IF NOT EXISTS FriendShips(
    ID INT PRIMARY KEY AUTO_INCREMENT,
    SenderID INT NOT NULL,
    ReceiverID INT NOT NULL,
    Status ENUM('pending', 'accepted') NOT NULL DEFAULT 'pending',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_friendship UNIQUE (SenderID, ReceiverID)
);

DELIMITER //

-- Trigger per impedire che InvitedBy sia NULL se Status è 'pending'
CREATE TRIGGER before_insert_participations
BEFORE INSERT ON Partecipations
FOR EACH ROW
BEGIN
    IF NEW.Status = 'pending' AND NEW.InvitedBy IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'InvitedBy must not be NULL when status is pending (INSERT).';
    END IF;
END;
//

DELIMITER ;


