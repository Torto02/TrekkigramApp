-- MySQL dump 10.13  Distrib 9.3.0, for Linux (aarch64)
--
-- Host: localhost    Database: TrekkigramDB
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `TrekkigramDB`
--

CREATE DATABASE /*!32312*/ IF NOT EXISTS `TrekkigramDB` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `TrekkigramDB`;

--
-- Table structure for table `Events`
--

DROP TABLE IF EXISTS `Events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Events` (
  `EventID` int NOT NULL AUTO_INCREMENT,
  `EventName` varchar(100) NOT NULL,
  `EventDescription` text,
  `Location` varchar(100) DEFAULT NULL,
  `DateTime` datetime DEFAULT NULL,
  `CreatorID` int NOT NULL,
  `Difficulty` int NOT NULL,
  `Latitude` decimal(9,6) DEFAULT NULL,
  `Longitude` decimal(9,6) DEFAULT NULL,
  `EventImages` json DEFAULT NULL,
  PRIMARY KEY (`EventID`),
  KEY `CreatorID` (`CreatorID`),
  CONSTRAINT `Events_ibfk_1` FOREIGN KEY (`CreatorID`) REFERENCES `Users` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Events`
--

LOCK TABLES `Events` WRITE;
/*!40000 ALTER TABLE `Events` DISABLE KEYS */;
INSERT INTO `Events` VALUES (8,'Tramonto sul Monte Baldo','Un\'escursione serale per ammirare il tramonto sul Lago di Garda dalla cima del Monte Baldo.','Garda, Verona, Veneto, 37016, Italia','2025-06-28 16:00:00',10,1,45.575651,10.708530,'[\"event_6841d6f5c2eaf8.21269654.jpg\", \"event_6841d6f5c38678.14047447.webp\", \"event_6841d6f5c3aa46.98618959.jpg\"]'),(9,'Sentiero del Viandante','Storico percorso lungo la sponda orientale del Lago di Como, con viste mozzafiato sull’acqua.','Varenna, Lecco, Lombardia, 23829, Italia','2025-06-30 07:30:00',1,2,46.009979,9.283159,'[\"event_6841ed820cf7c2.55175730.jpg\", \"event_6841ed820da342.78919051.webp\", \"event_6841ed820dec10.91687510.webp\"]'),(10,'Anello del Monte Resegone','Trek panoramico sul monte simbolo della Brianza, con salita ripida e creste rocciose.','Lecco, Lombardia, 23900, Italia','2025-07-20 02:00:00',1,1,45.900549,9.412025,'[\"event_6841f909175376.27731072.jpg\", \"event_6841f909164598.98502669.jpg\", \"event_6841f90916e1a3.28070244.jpeg\", \"event_6841f909171e57.78946036.jpg\"]'),(11,'Giro delle Tre Cime di Lavaredo','Itinerario iconico delle Dolomiti attorno alle celebri Tre Cime, tra paesaggi lunari e rocce imponenti.','Misurina, Auronzo di Cadore, Belluno, Veneto, 32041, Italia','2025-09-30 08:00:00',1,2,46.578526,12.252033,'[\"event_6841faf8305265.81760878.webp\", \"event_6841faf82f1143.29756966.jpg\", \"event_6841faf82f9806.17048405.jpg\", \"event_6841faf82fe210.19522303.jpg\", \"event_6841faf8301001.21048738.jpg\"]'),(12,'Cascate dell’Acquafraggia','Trek tra rocce e boschi con vista su spettacolari cascate naturali.','Piuro, Comunità montana della Valchiavenna, Sondrio, Lombardia, 23020, Italia','2025-08-20 09:00:00',1,1,46.328756,9.439665,'[\"event_6841fdc1a6a105.25344008.jpg\", \"event_6841fdc1a75a49.08378967.webp\", \"event_6841fdc1a786c9.55146624.jpg\", \"event_6841fdc1a7c7f7.31489569.jpg\"]'),(13,'Lago di Braies – Croda del Becco',' Escursione ad anello dal lago smeraldo alle pendici dolomitiche.','Lago di Braies, Braies, Val Pusteria, Bolzano, Trentino-Alto Adige, 39030, Italia','2025-06-30 07:00:00',8,2,46.699837,12.085657,'[\"event_6845e19a97e0f1.84942752.jpg\", \"event_6845e19a984ad7.07662481.webp\", \"event_6845e19a987882.23140112.webp\", \"event_6845e19a98aa79.00102738.jpg\", \"event_6845e19a98e4a1.67612038.jpg\"]'),(14,'Cima Sasso – Val di Mello','Salita impegnativa su pareti e pascoli alpini, nella Yosemite italiana.','Val Masino, Comunità montana della Valtellina di Morbegno, Sondrio, Lombardia, 23010, Italia','2025-06-30 07:00:00',8,3,46.245655,9.637888,'[\"event_6845e2baee8183.53990912.jpg\", \"event_6845e2baef0905.80653646.jpg\", \"event_6845e2baef4c57.43231926.jpg\", \"event_6845e2baefa573.60793997.webp\", \"event_6845e2baefe7d9.71858400.jpg\"]'),(15,'Cresta del Monte Legnone','Trekking verticale con vista dominante sul Lago di Como e sulle Alpi Retiche.','Colico, Lecco, Lombardia, 23823, Italia','2025-06-29 06:30:00',13,3,46.136311,9.373820,'[\"event_6845e41fc05ae4.82195594.jpg\", \"event_6845e41fc0f0e8.74874358.jpg\", \"event_6845e41fc16298.99979757.JPG\", \"event_6845e41fc1a704.79311711.jpg\"]'),(16,'Anello del Monte Zerbion','Percorso circolare con vista privilegiata sul Cervino e la valle centrale.','Saint-Vincent, Valle d\'Aosta, 11027, Italia','2025-06-28 00:30:00',6,3,45.750386,7.647884,'[\"event_6846b4f99f1d25.00574504.jpg\", \"event_6846b4f99f8b28.96421918.jpg\", \"event_6846b4f99fb375.23110032.jpg\", \"event_6846b4f99fe8a7.65237773.jpg\"]');
/*!40000 ALTER TABLE `Events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `FriendShips`
--

DROP TABLE IF EXISTS `FriendShips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `FriendShips` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `SenderID` int NOT NULL,
  `ReceiverID` int NOT NULL,
  `Status` enum('pending','accepted') NOT NULL DEFAULT 'pending',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `unique_friendship` (`SenderID`,`ReceiverID`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FriendShips`
--

LOCK TABLES `FriendShips` WRITE;
/*!40000 ALTER TABLE `FriendShips` DISABLE KEYS */;
INSERT INTO `FriendShips` VALUES (7,5,1,'accepted','2025-06-05 15:48:41'),(10,6,5,'pending','2025-06-05 16:05:16'),(11,8,1,'accepted','2025-06-05 17:11:04'),(12,12,1,'accepted','2025-06-05 17:25:12'),(13,12,6,'accepted','2025-06-05 17:25:36'),(14,12,10,'accepted','2025-06-05 17:25:42'),(15,12,9,'accepted','2025-06-05 17:26:39'),(16,12,11,'accepted','2025-06-05 17:26:50'),(17,12,8,'accepted','2025-06-05 17:27:00'),(18,1,9,'accepted','2025-06-05 17:28:01'),(19,1,11,'accepted','2025-06-05 17:28:09'),(22,9,8,'accepted','2025-06-05 17:34:12'),(23,9,6,'accepted','2025-06-05 17:34:21'),(24,9,11,'accepted','2025-06-05 17:34:29'),(25,9,10,'accepted','2025-06-05 17:34:37'),(26,11,6,'accepted','2025-06-05 17:35:07'),(27,11,10,'accepted','2025-06-05 17:35:21'),(28,11,8,'accepted','2025-06-05 17:35:30'),(29,6,10,'accepted','2025-06-05 17:36:09'),(30,6,8,'accepted','2025-06-05 17:36:16'),(31,8,10,'accepted','2025-06-05 17:37:14'),(32,13,10,'pending','2025-06-08 19:28:51'),(34,1,10,'accepted','2025-06-08 19:47:13'),(35,13,1,'pending','2025-06-09 12:24:52'),(36,13,12,'pending','2025-06-09 12:25:10'),(37,13,9,'pending','2025-06-09 12:25:17'),(38,1,6,'pending','2025-06-09 12:26:52');
/*!40000 ALTER TABLE `FriendShips` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Partecipations`
--

DROP TABLE IF EXISTS `Partecipations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Partecipations` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `EventID` int NOT NULL,
  `InvitedBy` int DEFAULT NULL,
  `Status` enum('participate','pending') NOT NULL DEFAULT 'pending',
  `JoinedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `UserID` (`UserID`,`EventID`),
  KEY `InvitedBy` (`InvitedBy`),
  KEY `EventID` (`EventID`),
  CONSTRAINT `Partecipations_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `Partecipations_ibfk_2` FOREIGN KEY (`InvitedBy`) REFERENCES `Users` (`UserID`) ON DELETE SET NULL,
  CONSTRAINT `Partecipations_ibfk_3` FOREIGN KEY (`EventID`) REFERENCES `Events` (`EventID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Partecipations`
--

LOCK TABLES `Partecipations` WRITE;
/*!40000 ALTER TABLE `Partecipations` DISABLE KEYS */;
INSERT INTO `Partecipations` VALUES (67,8,8,1,'pending','2025-06-06 10:01:11'),(68,9,8,1,'pending','2025-06-06 10:01:11'),(69,10,8,1,'pending','2025-06-06 10:01:11'),(70,12,8,1,'participate','2025-06-06 10:01:12'),(71,11,8,1,'pending','2025-06-06 10:01:12'),(72,6,8,1,'participate','2025-06-06 10:01:12'),(74,6,10,1,'participate','2025-06-08 18:52:18'),(75,8,10,1,'pending','2025-06-08 18:52:18'),(76,11,10,1,'pending','2025-06-08 18:52:19'),(77,10,10,1,'pending','2025-06-08 18:52:19'),(78,9,10,1,'pending','2025-06-08 18:52:19'),(79,12,10,1,'participate','2025-06-08 18:52:19'),(86,8,11,1,'pending','2025-06-09 10:14:39'),(87,6,11,1,'participate','2025-06-09 10:14:39'),(88,12,11,1,'participate','2025-06-09 10:14:40'),(89,11,11,1,'pending','2025-06-09 10:14:40'),(90,9,11,1,'pending','2025-06-09 10:14:41'),(92,10,11,NULL,'participate','2025-06-09 12:29:48'),(93,12,16,10,'pending','2025-06-09 12:30:35'),(94,6,16,10,'pending','2025-06-09 12:30:35'),(95,11,16,10,'pending','2025-06-09 12:30:35'),(96,8,16,10,'pending','2025-06-09 12:30:35'),(97,1,16,10,'pending','2025-06-09 12:30:35'),(98,9,16,10,'pending','2025-06-09 12:30:35'),(100,1,8,NULL,'participate','2025-06-09 12:38:01');
/*!40000 ALTER TABLE `Partecipations` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_insert_participations` BEFORE INSERT ON `Partecipations` FOR EACH ROW BEGIN
    IF NEW.Status = 'pending' AND NEW.InvitedBy IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'InvitedBy must not be NULL when status is pending (INSERT).';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(50) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `Name` varchar(50) NOT NULL,
  `Surname` varchar(50) NOT NULL,
  `Image` json DEFAULT NULL,
  `Privacy` tinyint(1) DEFAULT '0',
  `Description` text,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Username` (`Username`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'Torto02','riccardotortorelli@gmail.com','$2y$10$rao4bEkHci3EtMN8BVM8IexEkAfEr0MuhPQ5Zg21Bxso2ZUveLr8a','Riccardo','Tortorelli','\"profile_6841a8d4a80c27.02569617.png\"',0,'Ciao a tutti sono un nuovo utente di trekkigram'),(6,'Nico01','Nico@gmail.com','$2y$10$j9UxdU6.gGs1qIaov6lNh.aLsVZgCU2XGHk5IwWcVJfIs98XpvrWS','Nicolò','Migliorini','\"profile_6841bffb6d7b16.58204553.png\"',0,NULL),(8,'Vinze02','vinze@gmail.com','$2y$10$uvKD50xYVoA2UwH5vgvdZuhjrfAq2VU84opTGiB85RwT9TNKTAadG','Vincenzo','Venturella','\"profile_6841c314cb4c49.70999528.png\"',0,NULL),(9,'Sara02','Sara@gmail.com','$2y$10$5mfouZyCbjbuH2Lg574HXe11iYwbI5eKGDwVHjraXD1fazGuPuc7.','Sara','Fogliati','\"profile_6841d19c1199e1.08265871.png\"',0,NULL),(10,'Gigiuz01','gigi@gmail.com','$2y$10$vpET5NzT2Oax/TxN.hGUfOuXe3ZfDR5TQkjOvWAYNlb5doJR3IVZC','Gigi','Aiello','\"profile_6841d26ed589b8.57709361.png\"',0,''),(11,'Pizzi02','giulia@gmail.com','$2y$10$uXuO6AK5NrZX30yQd5rkBeTSidGlsvbpD4giAEj23Tv19UpAYX2qq','Giulia','Pizzi','\"profile_6841d2c2ca9131.53188819.png\"',0,''),(12,'Marti00','Martino@gmail.com','$2y$10$kPsNgn2RUQMEPc6GCRZvZuxN1fvOqDQujBD.mGjkkoK8TrvuYo.SC','Martino','Freschi','\"profile_6841d2ee19b667.18023815.png\"',0,NULL),(13,'Gio03','giorgia@gmail.com','$2y$10$fjs3/4dQW5scJObG568Ej.f9jmNqHWBjW/eE7sDngSwwvvl1ioW4i','Giorgia','Alberti','\"profile_6845e45f496e36.61402309.png\"',1,''),(14,'Davi01','davi@gmail.com','$2y$10$Xw8E0FvLPfWqT5g1RutcrO5EdnN3ar5Fud4gp0daz5T1r0dAvn60y','Davide','Gandolfi','\"profile_6845e5c75876d0.39837062.png\"',1,''),(15,'Angy03','Angy@gmail.com','$2y$10$cyryX8JQpdxc6pG5gN0WRugOKiIde.onWaRpSGNIAUtrtlouNRnHW','Angela','Raimo','\"profile_6845e6001429d3.86081503.png\"',1,'');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-10 13:10:30
