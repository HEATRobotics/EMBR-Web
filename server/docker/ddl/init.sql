CREATE DATABASE IF NOT EXISTS embr;

USE embr;

-- Disable foreign key checks temporarily
SET foreign_key_checks = 0;

-- just for testing while the database gets fully setup
DROP TABLE IF EXISTS bot;
DROP TABLE IF EXISTS mission;
DROP TABLE IF EXISTS position;
DROP TABLE IF EXISTS temperature;
DROP TABLE IF EXISTS battery;

SET foreign_key_checks = 1;

CREATE TABLE bot (
    botID INT PRIMARY KEY,
    assignmentStatus ENUM('ready', 'assigned', 'inactive') NOT NULL DEFAULT 'ready',
    lastOnline DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE position (
    id INT AUTO_INCREMENT PRIMARY KEY,
    botID INT NOT NULL,
    clockTime DATETIME NOT NULL,
    latitude DECIMAL(9,7), -- Allow for 1mm accuracy
    longitude DECIMAL(10,7), -- Allow for 1mm accuracy
    altitude FLOAT,
    relativeAltitude FLOAT,
    groundXSpeed FLOAT,
    groundYSpeed FLOAT,
    groundZSpeed FLOAT,
    vehicleHeading FLOAT,
    FOREIGN KEY (botID) REFERENCES bot(botID) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE hotspot (
    hotspotID INT AUTO_INCREMENT PRIMARY KEY, 
    botID INT NOT NULL, 
    latitude FLOAT NOT NULL, 
    longitude FLOAT NOT NULL,
    FOREIGN KEY(botID) REFERENCES bot(botID) ON DELETE CASCADE

) ENGINE=InnoDB;

CREATE TABLE temperature (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotspotID INT NOT NULL,
    clockTime DATETIME NOT NULL,
    temperature FLOAT NOT NULL,
    FOREIGN KEY (hotspotID) REFERENCES hotspot(hotspotID) ON DELETE CASCADE     -- if bot is deleted, also delete its records in this table
) ENGINE=InnoDB;




CREATE TABLE battery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    botID INT NOT NULL,
    clockTime DATETIME NOT NULL,
    battery INT NOT NULL,
    FOREIGN KEY (botID) REFERENCES bot(botID) ON DELETE CASCADE     -- if bot is deleted, also delete its records in this table
) ENGINE=InnoDB;

CREATE TABLE mission (
    missionID INT AUTO_INCREMENT PRIMARY KEY,
    botID INT NOT NULL, 
    missionName VARCHAR(255) NOT NULL,
    areaCoordinates JSON, -- Store area coordinates as JSON (lat/lng pairs)
    progress DECIMAL(5,2), 
    avgTemp DECIMAL(5,2),
    timePassed INT, 
    timeEstimated INT, 
    timeCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- when this table is updated, set lastUpdated to current time
    FOREIGN KEY (botID) REFERENCES bot(botID) ON DELETE CASCADE     -- if bot is deleted, also delete its records in this table
) ENGINE=InnoDB;



INSERT INTO bot (botID, assignmentStatus) VALUES (1, 'assigned'), (2, 'ready'), (3, 'ready');       -- create 3 sample bots

INSERT INTO mission (botID, missionName, areaCoordinates, progress, avgTemp, timePassed, timeEstimated) 
VALUES (1, 'Mission K-lona', '{
    "north": 49.94909967001919,
    "south": 49.92712108869749,
    "east": -119.38269345092772,
    "west": -119.40673239135744
  }', 50.00, 22.50, 120, 240);


-- Insert fake data into the position table for botID 1
INSERT INTO position (botID, clockTime, latitude, longitude, altitude, relativeAltitude, groundXSpeed, groundYSpeed, groundZSpeed, vehicleHeading)
VALUES
    (1, '2025-04-26 00:00:00', 51.5074, -0.1278, 10.5, 0.5, 0.0, 1.5, 0.2, 90.0),  -- Example with latitude, longitude of London
    (1, '2025-04-26 01:00:00', 51.5075, -0.1277, 11.0, 1.0, 0.1, 1.6, 0.3, 91.0),
    (1, '2025-04-26 02:00:00', 51.5076, -0.1276, 12.0, 1.2, 0.2, 1.7, 0.4, 92.0);

-- Insert fake data into the temperature table for botID 1
INSERT INTO temperature (botID, clockTime, temperature)
VALUES
    (1, '2025-04-26 00:00:00', 22.5),
    (1, '2025-04-26 01:00:00', 22.7),
    (1, '2025-04-26 02:00:00', 22.8);

