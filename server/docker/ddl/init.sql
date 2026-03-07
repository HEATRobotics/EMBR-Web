CREATE DATABASE IF NOT EXISTS embr;

USE embr;

SET foreign_key_checks = 0;
DROP TABLE IF EXISTS temperature;
DROP TABLE IF EXISTS battery;
DROP TABLE IF EXISTS position;
DROP TABLE IF EXISTS hotspot;
DROP TABLE IF EXISTS bot_mission_assignment;
DROP TABLE IF EXISTS mission;
DROP TABLE IF EXISTS bot;
SET foreign_key_checks = 1;

CREATE TABLE bot (
  botID INT PRIMARY KEY,
  assignmentStatus ENUM('ready','assigned','inactive','active') NOT NULL DEFAULT 'ready',
  lastOnline DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE mission (
  missionID INT AUTO_INCREMENT PRIMARY KEY,
  missionName VARCHAR(255) NOT NULL,
  areaCoordinates JSON,
  progress DECIMAL(5,2),
  avgTemp DECIMAL(5,2),
  timeEstimated INT,
  timeStart TIMESTAMP NULL DEFAULT NULL,
  timeEnd TIMESTAMP NULL DEFAULT NULL,
  timeCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Many-to-many: bots assigned to missions
CREATE TABLE bot_mission_assignment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  botID INT NOT NULL,
  missionID INT NOT NULL,
  assignedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_bot_mission (botID, missionID),
  FOREIGN KEY (botID) REFERENCES bot(botID) ON DELETE CASCADE,
  FOREIGN KEY (missionID) REFERENCES mission(missionID) ON DELETE CASCADE,
  INDEX idx_assignment_bot (botID),
  INDEX idx_assignment_mission (missionID)
) ENGINE=InnoDB;

CREATE TABLE position (
  id INT AUTO_INCREMENT PRIMARY KEY,
  botID INT NOT NULL,
  missionID INT NULL,
  clockTime DATETIME NOT NULL,
  latitude DECIMAL(9,7),
  longitude DECIMAL(10,7),
  altitude FLOAT,
  relativeAltitude FLOAT,
  groundXSpeed FLOAT,
  groundYSpeed FLOAT,
  groundZSpeed FLOAT,
  vehicleHeading FLOAT,
  FOREIGN KEY (botID) REFERENCES bot(botID) ON DELETE CASCADE,
  FOREIGN KEY (missionID) REFERENCES mission(missionID) ON DELETE SET NULL,
  INDEX idx_position_bot_time (botID, clockTime),
  INDEX idx_position_mission_time (missionID, clockTime)
) ENGINE=InnoDB;

CREATE TABLE hotspot (
  id INT AUTO_INCREMENT PRIMARY KEY,
  missionID INT NULL,
  botID INT NOT NULL,
  detectedAt DATETIME NOT NULL,
  latitude DECIMAL(9,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  altitude FLOAT NOT NULL,
  notes VARCHAR(255) NULL,
  FOREIGN KEY (missionID) REFERENCES mission(missionID) ON DELETE SET NULL,
  FOREIGN KEY (botID) REFERENCES bot(botID) ON DELETE CASCADE,
  INDEX idx_hotspot_mission (missionID, detectedAt),
  INDEX idx_hotspot_bot (botID, detectedAt)
) ENGINE=InnoDB;

CREATE TABLE temperature (
  id INT AUTO_INCREMENT PRIMARY KEY,
  botID INT NOT NULL,
  hotspotID INT NULL,
  clockTime DATETIME NOT NULL,
  temperature FLOAT NOT NULL,
  FOREIGN KEY (botID) REFERENCES bot(botID) ON DELETE CASCADE,
  FOREIGN KEY (hotspotID) REFERENCES hotspot(id) ON DELETE SET NULL,
  INDEX idx_temp_bot_time (botID, clockTime),
  INDEX idx_temp_hotspot (hotspotID)
) ENGINE=InnoDB;

CREATE TABLE battery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  botID INT NOT NULL,
  missionID INT NULL,
  clockTime DATETIME NOT NULL,
  battery INT NOT NULL,
  FOREIGN KEY (botID) REFERENCES bot(botID) ON DELETE CASCADE,
  FOREIGN KEY (missionID) REFERENCES mission(missionID) ON DELETE SET NULL,
  INDEX idx_battery_bot_time (botID, clockTime),
  INDEX idx_battery_mission_time (missionID, clockTime)
) ENGINE=InnoDB;

-- Sample data
INSERT INTO bot (botID, assignmentStatus) VALUES (1,'active'),(2,'ready'),(3,'ready');

INSERT INTO mission (missionName, areaCoordinates, progress, avgTemp, timeEstimated, timeStart)
VALUES (
  'Mission K-lona',
  JSON_OBJECT('north', 49.94909967001919, 'south', 49.92712108869749, 'east', -119.38269345092772, 'west', -119.40673239135744),
  50.00, 22.50, 240, '2025-04-26 00:00:00'
);

-- Assign bot 1 to mission 1
INSERT INTO bot_mission_assignment (botID, missionID) VALUES (1, 1), (2, 1), (3, 1);

-- Telemetry tagged with missionID
INSERT INTO position (botID, missionID, clockTime, latitude, longitude, altitude, relativeAltitude, groundXSpeed, groundYSpeed, groundZSpeed, vehicleHeading) VALUES
  (1, 1, '2025-04-26 00:00:00', 51.5074, -0.1278, 10.5, 0.5, 0.0, 1.5, 0.2, 90.0),
  (1, 1, '2025-04-26 01:00:00', 51.5075, -0.1277, 11.0, 1.0, 0.1, 1.6, 0.3, 91.0),
  (1, 1, '2025-04-26 02:00:00', 51.5076, -0.1276, 12.0, 1.2, 0.2, 1.7, 0.4, 92.0);

-- Hotspot and its 10 temperature samples
INSERT INTO hotspot (missionID, botID, detectedAt, latitude, longitude, altitude) VALUES (1, 1, '2025-04-26 01:05:00', 51.5075, -0.1277, 10.0);
SET @hotspotId = LAST_INSERT_ID();

INSERT INTO temperature (botID, hotspotID, clockTime, temperature) VALUES
  (1,  @hotspotId, '2025-04-26 01:05:01', 82.1),
  (1,  @hotspotId, '2025-04-26 01:05:02', 83.0),
  (1,  @hotspotId, '2025-04-26 01:05:03', 84.2),
  (1,  @hotspotId, '2025-04-26 01:05:04', 85.0),
  (1,  @hotspotId, '2025-04-26 01:05:05', 84.7),
  (1,  @hotspotId, '2025-04-26 01:05:06', 83.9),
  (1,  @hotspotId, '2025-04-26 01:05:07', 82.8),
  (1, @hotspotId, '2025-04-26 01:05:08', 81.6),
  (1, @hotspotId, '2025-04-26 01:05:09', 80.9),
  (1, @hotspotId, '2025-04-26 01:05:10', 80.2);

INSERT INTO battery (botID, missionID, clockTime, battery) VALUES
  (1, 1, '2025-04-26 00:00:00', 97),
  (1, 1, '2025-04-26 01:00:00', 93),
  (1, 1, '2025-04-26 02:00:00', 90);