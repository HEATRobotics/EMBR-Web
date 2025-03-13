CREATE DATABASE IF NOT EXISTS embr;

USE embr;

-- just for testing while the database gets fully setup
DROP TABLE IF EXISTS position;
DROP TABLE IF EXISTS temperature;
DROP TABLE IF EXISTS battery;
DROP TABLE IF EXISTS fleet;

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

INSERT INTO fleet VALUES (1,1);
INSERT INTO fleet VALUES (2,2);
INSERT INTO fleet VALUES (3,3);

