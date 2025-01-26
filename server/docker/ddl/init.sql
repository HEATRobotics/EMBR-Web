CREATE DATABASE IF NOT EXISTS embr;

USE embr;

-- just for testing while the database gets fully setup
DROP TABLE IF EXISTS position;
DROP TABLE IF EXISTS temperature;
DROP TABLE IF EXISTS battery;
DROP TABLE IF EXISTS fleet;

CREATE TABLE position (
    botID INT NOT NULL,
    clockTime DATETIME NOT NULL,
    latitude FLOAT,
    longitude FLOAT,
    altitude FLOAT,
    relativeAltitude FLOAT,
    groundXSpeed FLOAT,
    groundYSpeed FLOAT,
    groundZSpeed FLOAT,
    vehicleHeading FLOAT,
    PRIMARY KEY(botID, clockTime)
) ENGINE=InnoDB;

CREATE TABLE temperature (
    botID INT NOT NULL,
    clockTime DATETIME NOT NULL,
    temperature FLOAT NOT NULL,
    PRIMARY KEY(botID, clockTime)
) ENGINE=InnoDB;

CREATE TABLE battery (
    botID INT NOT NULL,
    clockTime DATETIME NOT NULL,
    battery INT NOT NULL,
    PRIMARY KEY(botID, clockTime)
) ENGINE=InnoDB;

CREATE TABLE fleet (
    botID INT NOT NULL,
    fleetID INT,
    PRIMARY KEY (botID)
) ENGINE=InnoDB;

INSERT INTO fleet VALUES (1,1);
INSERT INTO fleet VALUES (2,1);
INSERT INTO fleet VALUES (3,2);
INSERT INTO fleet VALUES (4,2);
INSERT INTO fleet VALUES (5,3);

