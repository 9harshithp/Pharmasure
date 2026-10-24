-- MySQL dump 10.13  Distrib 8.4.11, for Linux (x86_64)
--
-- Host: localhost    Database: blister
-- ------------------------------------------------------
-- Server version	8.4.11

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
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `id` int NOT NULL,
  `email` varchar(40) DEFAULT NULL,
  `password` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,'pharmacist@pharmasure.com','admin123');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consumed`
--

DROP TABLE IF EXISTS `consumed`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consumed` (
  `cid` int NOT NULL AUTO_INCREMENT,
  `date_time` datetime(6) DEFAULT NULL,
  `m_id` int DEFAULT NULL,
  PRIMARY KEY (`cid`),
  KEY `FKbgtf2fsnp9fu8g0necsul7jkd` (`m_id`),
  CONSTRAINT `FKbgtf2fsnp9fu8g0necsul7jkd` FOREIGN KEY (`m_id`) REFERENCES `medication` (`mid`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consumed`
--

LOCK TABLES `consumed` WRITE;
/*!40000 ALTER TABLE `consumed` DISABLE KEYS */;
INSERT INTO `consumed` VALUES (1,'2026-10-15 09:05:00.000000',1),(2,'2026-10-15 14:15:00.000000',1),(3,'2026-10-15 19:10:00.000000',1),(4,'2026-10-15 08:50:00.000000',3),(5,'2026-10-15 08:45:00.000000',4),(6,'2026-10-16 09:20:00.000000',1),(7,'2026-10-16 14:45:00.000000',1),(8,'2026-10-16 19:05:00.000000',1),(9,'2026-10-16 09:10:00.000000',3),(10,'2026-10-16 19:30:00.000000',3),(11,'2026-10-17 08:55:00.000000',1),(12,'2026-10-17 14:00:00.000000',1),(13,'2026-10-17 20:15:00.000000',1),(14,'2026-10-17 09:00:00.000000',2),(15,'2026-10-17 09:05:00.000000',4),(16,'2026-10-18 09:15:00.000000',1),(17,'2026-10-18 14:20:00.000000',1),(18,'2026-10-18 19:10:00.000000',1),(19,'2026-10-18 09:00:00.000000',2),(20,'2026-10-18 19:00:00.000000',3),(21,'2026-10-18 08:50:00.000000',4),(22,'2026-10-19 09:10:00.000000',1),(23,'2026-10-19 14:10:00.000000',1),(24,'2026-10-19 09:05:00.000000',3),(25,'2026-10-19 08:45:00.000000',4),(26,'2026-10-19 20:46:37.350535',1),(27,'2026-10-19 20:46:40.466884',2);
/*!40000 ALTER TABLE `consumed` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `amount` double NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `table_name` varchar(255) DEFAULT NULL,
  `tablet_qty` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (1,650,'2028-06-30','Amoxicillin 500mg',120),(2,1150.5,'2029-07-31','Levoflox-750',85),(3,420,'2027-11-15','Dolo 650mg',250),(4,580,'2028-02-28','Azithral 500mg',45),(5,310,'2026-10-23','Cefixime 200mg',30),(6,490,'2026-10-27','Montair-LC',50),(7,75,'2026-09-15','Cetirizine 10mg',15),(8,140,'2026-10-05','Omeprazole 20mg',20);
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medication`
--

DROP TABLE IF EXISTS `medication`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medication` (
  `mid` int NOT NULL AUTO_INCREMENT,
  `doctor` varchar(255) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `table_name` varchar(255) DEFAULT NULL,
  `tablet_qty` int DEFAULT NULL,
  `timing` varchar(255) DEFAULT NULL,
  `p_id` int DEFAULT NULL,
  PRIMARY KEY (`mid`),
  KEY `FKj25g3ri2mcxtx5xqm104m7953` (`p_id`),
  CONSTRAINT `FKj25g3ri2mcxtx5xqm104m7953` FOREIGN KEY (`p_id`) REFERENCES `patient` (`pid`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medication`
--

LOCK TABLES `medication` WRITE;
/*!40000 ALTER TABLE `medication` DISABLE KEYS */;
INSERT INTO `medication` VALUES (1,'sharma','2029-07-31','Levoflox-750',7,'Morning, Afternoon, Evening',1),(2,'rohith','2027-09-30','GANPOD-CV 325',2,'Morning',1),(3,'Dr. Rohith','2027-12-31','Metformin 500mg',20,'Morning, Evening',1),(4,'Dr. Sharma','2028-05-30','Pantoprazole 40mg',15,'Morning',1),(5,'Dr. Anita','2026-10-26','Paracetamol 650mg',10,'Afternoon, Evening',1);
/*!40000 ALTER TABLE `medication` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient`
--

DROP TABLE IF EXISTS `patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient` (
  `pid` int NOT NULL AUTO_INCREMENT,
  `alert` bit(1) NOT NULL,
  `bp` varchar(255) DEFAULT NULL,
  `care_taker_email` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `regular_doctor` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`pid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient`
--

LOCK TABLES `patient` WRITE;
/*!40000 ALTER TABLE `patient` DISABLE KEYS */;
INSERT INTO `patient` VALUES (1,_binary '\0',NULL,'harshithp9141@gmail.com',NULL,'harshithp914@gmail.com','harshithp','student123',NULL);
/*!40000 ALTER TABLE `patient` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-24 14:30:03
