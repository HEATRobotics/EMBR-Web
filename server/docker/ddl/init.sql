CREATE DATABASE IF NOT EXISTS embr;

USE embr;

-- Disable foreign key checks temporarily
SET foreign_key_checks = 0;

-- just for testing while the database gets fully setup
DROP TABLE IF EXISTS fleet;
DROP TABLE IF EXISTS mission;
DROP TABLE IF EXISTS position;
DROP TABLE IF EXISTS temperature;
DROP TABLE IF EXISTS battery;

-- Re-enable foreign key checks
SET foreign_key_checks = 1;

-- Create the fleet table first
CREATE TABLE fleet (
    botID INT NOT NULL PRIMARY KEY,
    fleetID INT
) ENGINE=InnoDB;

CREATE TABLE position (
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
    PRIMARY KEY(botID, clockTime),
    FOREIGN KEY (botID) REFERENCES fleet(botID) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE temperature (
    botID INT NOT NULL,
    clockTime DATETIME NOT NULL,
    temperature FLOAT NOT NULL,
    PRIMARY KEY(botID, clockTime),
    FOREIGN KEY (botID) REFERENCES fleet(botID) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE battery (
    botID INT NOT NULL,
    clockTime DATETIME NOT NULL,
    battery INT NOT NULL,
    PRIMARY KEY(botID, clockTime),
    FOREIGN KEY (botID) REFERENCES fleet(botID) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE mission (
    missionID INT AUTO_INCREMENT PRIMARY KEY,
    fleetID INT NOT NULL, 
    missionName VARCHAR(255) NOT NULL,
    areaCoordinates JSON, -- Store area coordinates as JSON (lat/lng pairs)
    progress DECIMAL(5,2), 
    avgTemp DECIMAL(5,2),
    timePassed INT, 
    timeEstimated INT, 
    timeCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- when this table is updated, set lastUpdated to current time
    FOREIGN KEY (fleetID) REFERENCES fleet(botID)
) ENGINE=InnoDB;

INSERT INTO mission (fleetID, missionName, areaCoordinates, progress, avgTemp, timePassed, timeEstimated) 
VALUES (1, 'Mission K-lona', '{
    "north": 49.94909967001919,
    "south": 49.92712108869749,
    "east": -119.38269345092772,
    "west": -119.40673239135744
  }', 50.00, 22.50, 120, 240);

INSERT INTO fleet VALUES (1,1);
INSERT INTO fleet VALUES (2,2);
INSERT INTO fleet VALUES (3,3);

