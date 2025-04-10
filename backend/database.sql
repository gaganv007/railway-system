-- database.sql - Complete Railway Ticketing System Database

-- Create the database
DROP DATABASE IF EXISTS railway_system;
CREATE DATABASE IF NOT EXISTS railway_system;
USE railway_system;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  contact_number VARCHAR(15),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stations table
CREATE TABLE IF NOT EXISTS stations (
  station_id INT AUTO_INCREMENT PRIMARY KEY,
  station_name VARCHAR(100) NOT NULL,
  station_code VARCHAR(10) NOT NULL UNIQUE,
  city VARCHAR(100) NOT NULL
);

-- Trains table
CREATE TABLE IF NOT EXISTS trains (
  train_id INT AUTO_INCREMENT PRIMARY KEY,
  train_name VARCHAR(100) NOT NULL,
  train_number VARCHAR(20) NOT NULL UNIQUE,
  source VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  duration VARCHAR(20),
  distance INT,
  total_seats INT NOT NULL,
  available_seats INT NOT NULL,
  fare DECIMAL(10, 2) NOT NULL,
  class_type ENUM('Sleeper', 'AC 3 Tier', 'AC 2 Tier', 'AC 1 Tier', 'General', 'AC Chair Car') NOT NULL);

-- Train routes table for intermediate stations
CREATE TABLE IF NOT EXISTS train_routes (
  route_id INT AUTO_INCREMENT PRIMARY KEY,
  train_id INT NOT NULL,
  station_id INT NOT NULL,
  arrival_time TIME,
  departure_time TIME,
  day INT DEFAULT 1,
  stop_number INT NOT NULL,
  FOREIGN KEY (train_id) REFERENCES trains(train_id) ON DELETE CASCADE,
  FOREIGN KEY (station_id) REFERENCES stations(station_id) ON DELETE CASCADE
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  train_id INT NOT NULL,
  pnr_number VARCHAR(15) NOT NULL UNIQUE,
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  journey_date DATE NOT NULL,
  number_of_passengers INT NOT NULL,
  total_fare DECIMAL(10, 2) NOT NULL,
  status ENUM('Confirmed', 'Waiting', 'Cancelled') DEFAULT 'Confirmed',
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (train_id) REFERENCES trains(train_id) ON DELETE CASCADE
);

-- Passengers table
CREATE TABLE IF NOT EXISTS passengers (
  passenger_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  age INT NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  seat_number VARCHAR(10),
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);

-- Insert sample data

-- Sample stations
INSERT IGNORE INTO stations (station_name, station_code, city) VALUES
('New Delhi Railway Station', 'NDLS', 'Delhi'),
('Chhatrapati Shivaji Terminus', 'CSMT', 'Mumbai'),
('Howrah Junction', 'HWH', 'Kolkata'),
('Chennai Central', 'MAS', 'Chennai'),
('Bangalore City Junction', 'SBC', 'Bangalore'),
('Ahmedabad Junction', 'ADI', 'Ahmedabad'),
('Mysore Junction', 'MYS', 'Mysore'),
('Jaipur Junction', 'JP', 'Jaipur'),
('Lucknow Junction', 'LJN', 'Lucknow'),
('Hyderabad Deccan', 'HYD', 'Hyderabad');

-- Sample trains
INSERT INTO trains (train_name, train_number, source, destination, departure_time, arrival_time, duration, distance, total_seats, available_seats, fare, class_type) VALUES
('Rajdhani Express', '12951', 'Delhi', 'Mumbai', '16:25:00', '08:15:00', '16h 35m', 1384, 800, 650, 1350.00, 'AC 3 Tier'),
('Shatabdi Express', '12028', 'Bangalore', 'Chennai', '06:00:00', '11:10:00', '5h 10m', 362, 700, 520, 750.00, 'AC Chair Car'),
('Duronto Express', '12260', 'Kolkata', 'Delhi', '08:30:00', '17:50:00', '17h 20m', 1453, 750, 600, 1500.00, 'AC 3 Tier'),
('Double Decker Express', '12932', 'Mumbai', 'Ahmedabad', '06:25:00', '12:50:00', '6h 25m', 493, 600, 450, 820.00, 'AC Chair Car'),
('Mysore Express', '16231', 'Bangalore', 'Mysore', '08:10:00', '10:30:00', '2h 20m', 139, 500, 380, 350.00, 'General'),
('Chennai Mail', '12658', 'Chennai', 'Hyderabad', '23:15:00', '08:45:00', '9h 30m', 625, 650, 500, 950.00, 'Sleeper'),
('Jaipur Superfast', '12015', 'Delhi', 'Jaipur', '06:05:00', '10:30:00', '4h 25m', 310, 550, 420, 550.00, 'AC Chair Car'),
('Lucknow Express', '12229', 'Delhi', 'Lucknow', '20:30:00', '06:45:00', '10h 15m', 495, 700, 580, 850.00, 'AC 3 Tier'),
('Mumbai Superfast', '16588', 'Mumbai', 'Bangalore', '16:40:00', '09:20:00', '16h 40m', 984, 720, 650, 1250.00, 'AC 2 Tier'),
('Hyderabad Express', '18646', 'Hyderabad', 'Chennai', '15:20:00', '23:45:00', '8h 25m', 626, 600, 540, 920.00, 'AC 3 Tier');

-- Sample train routes (for the first train only)
INSERT INTO train_routes (train_id, station_id, arrival_time, departure_time, day, stop_number) VALUES
(1, 1, NULL, '16:25:00', 1, 1),        -- Delhi
(1, 8, '20:15:00', '20:20:00', 1, 2),  -- Jaipur
(1, 6, '00:15:00', '00:20:00', 2, 3),  -- Ahmedabad
(1, 2, '08:15:00', NULL, 2, 4);        -- Mumbai

-- Sample user (password is 'password123' hashed)
INSERT INTO users (name, email, password, contact_number) VALUES
('Test User', 'test@example.com', '$2b$10$3euPcnQxGQ.PQxK.SJtQKO7yYMzRiDQxQ5jJvFMGe1vfEY.vChvcu', '9876543210');

-- Sample bookings
INSERT INTO bookings (user_id, train_id, pnr_number, journey_date, number_of_passengers, total_fare, status) VALUES
(1, 1, '1234567890', '2025-05-15', 2, 2700.00, 'Confirmed'),
(1, 3, '9876543210', '2025-05-20', 1, 1500.00, 'Confirmed');

-- Sample passengers
INSERT INTO passengers (booking_id, name, age, gender, seat_number) VALUES
(1, 'Test User', 30, 'Male', 'B1-22'),
(1, 'Jane Doe', 28, 'Female', 'B1-23'),
(2, 'Test User', 30, 'Male', 'A3-45');