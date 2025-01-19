CREATE DATABASE IF NOT EXISTS embr;

USE embr;

-- just for testing while the database gets fully setup
DROP TABLE IF EXISTS position;
DROP TABLE IF EXISTS temperature;

CREATE TABLE position (
    ID INT AUTO_INCREMENT,
    vehicleID INT NOT NULL,
    timestamp DATETIME,
    latitude FLOAT,
    longitude FLOAT,
    altitude FLOAT,
    relativeAltitude FLOAT,
    groundXSpeed FLOAT,
    groundYSpeed FLOAT,
    groundZSpeed FLOAT,
    vehicleHeading FLOAT,
    PRIMARY KEY(ID)
) ENGINE=InnoDB;

CREATE TABLE temperature (
    ID INT AUTO_INCREMENT,
    vehicleID INT NOT NULL,
    timestamp DATETIME,
    temperature FLOAT,
    PRIMARY KEY(ID)
) ENGINE=InnoDB;
