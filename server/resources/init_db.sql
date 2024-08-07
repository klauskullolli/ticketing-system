-- Drop tables if they exist
DROP TABLE IF EXISTS TextBlock;
DROP TABLE IF EXISTS Ticket;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Session;   


-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- Create User table with id and unique username
CREATE TABLE User
(
  id INTEGER NOT NULL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(255) NOT NULL,   
  password VARCHAR(255) NOT NULL,
  salt VARCHAR(255) NOT NULL
);

-- Create Ticket table with foreign key referencing User(username)
CREATE TABLE Ticket
(
  id INTEGER NOT NULL PRIMARY KEY,
  state VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  timestamp INTEGER NOT NULL,
  owner VARCHAR(255) NOT NULL,
  FOREIGN KEY (owner) REFERENCES User(username) ON UPDATE CASCADE ON DELETE CASCADE

);

-- Create TextBlock table with foreign keys referencing User(username) and Ticket(id)
CREATE TABLE TextBlock
(
  id INTEGER NOT NULL PRIMARY KEY,
  text VARCHAR(255) NOT NULL,
  timestamp INTEGER NOT NULL,
  owner VARCHAR(255) NOT NULL,
  ticket_id INTEGER NOT NULL,
  FOREIGN KEY (owner) REFERENCES User(username) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (ticket_id) REFERENCES Ticket(id) ON UPDATE CASCADE ON DELETE CASCADE
);


-- Create Session table with foreign key referencing User(username)
CREATE TABLE Session
(
  id INTEGER NOT NULL PRIMARY KEY,
  token VARCHAR(255) NOT NULL,
  username INTEGER NOT NULL,
  FOREIGN KEY (username) REFERENCES User(username) ON UPDATE CASCADE ON DELETE CASCADE
);

