// server.js - Complete Railway Ticketing System Backend

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Create database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'railway_system'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// ========================
// MIDDLEWARE
// ========================

// Authentication middleware
const authenticateToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Invalid token. Please login again.'
    });
  }
};

// ========================
// HELPER FUNCTIONS
// ========================

// Generate PNR number
const generatePNR = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

// ========================
// USER ROUTES
// ========================

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, contactNumber } = req.body;
    
    // Check if user already exists
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Insert new user
      db.query(
        'INSERT INTO users (name, email, password, contact_number) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, contactNumber],
        (err, result) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Failed to register user' });
          }
          
          // Create token
          const token = jwt.sign(
            { userId: result.insertId, email },
            JWT_SECRET,
            { expiresIn: '24h' }
          );
          
          res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
              id: result.insertId,
              name,
              email
            }
          });
        }
      );
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      const user = results[0];
      
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      // Create token
      const token = jwt.sign(
        { userId: user.user_id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        token,
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email
        }
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    db.query('SELECT user_id, name, email, contact_number, created_at FROM users WHERE user_id = ?', 
      [req.user.userId],
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ success: false, message: 'Server error' });
        }
        
        if (results.length === 0) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({
          success: true,
          user: results[0]
        });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ========================
// TRAIN ROUTES
// ========================

// Get all trains
app.get('/api/trains', (req, res) => {
  try {
    db.query('SELECT * FROM trains ORDER BY train_name', (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch trains' });
      }
      
      res.json({
        success: true,
        count: results.length,
        data: results
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Search trains
app.get('/api/trains/search', (req, res) => {
  try {
    const { source, destination, date, class_type } = req.query;
    
    if (!source || !destination) {
      return res.status(400).json({ success: false, message: 'Source and destination are required' });
    }
    
    let query = `
      SELECT * FROM trains 
      WHERE source LIKE ? AND destination LIKE ?
    `;
    
    const queryParams = [`%${source}%`, `%${destination}%`];
    
    if (class_type) {
      query += ' AND class_type = ?';
      queryParams.push(class_type);
    }
    
    query += ' ORDER BY departure_time';
    
    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Failed to search trains' });
      }
      
      res.json({
        success: true,
        count: results.length,
        data: results
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get train by ID
app.get('/api/trains/:id', (req, res) => {
  try {
    const trainId = req.params.id;
    
    db.query('SELECT * FROM trains WHERE train_id = ?', [trainId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch train details' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'Train not found' });
      }
      
      // Get route information for this train
      db.query(
        `SELECT tr.*, s.station_name, s.station_code, s.city 
         FROM train_routes tr
         JOIN stations s ON tr.station_id = s.station_id
         WHERE tr.train_id = ?
         ORDER BY tr.stop_number`,
        [trainId],
        (err, routeResults) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch route details' });
          }
          
          const trainDetails = { ...results[0], route: routeResults };
          
          res.json({
            success: true,
            data: trainDetails
          });
        }
      );
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ========================
// BOOKING ROUTES
// ========================

// Create a new booking
app.post('/api/bookings', authenticateToken, (req, res) => {
  try {
    const { trainId, journeyDate, passengers } = req.body;
    const userId = req.user.userId;
    
    if (!trainId || !journeyDate || !passengers || passengers.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required booking information' });
    }
    
    // Get train details to calculate fare
    db.query('SELECT * FROM trains WHERE train_id = ?', [trainId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Failed to process booking' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'Train not found' });
      }
      
      const train = results[0];
      const totalFare = train.fare * passengers.length;
      const pnrNumber = generatePNR();
      
      // Check if enough seats available
      if (train.available_seats < passengers.length) {
        return res.status(400).json({ 
          success: false, 
          message: `Only ${train.available_seats} seats available for this train` 
        });
      }
      
      // Begin transaction
      db.beginTransaction(async (err) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ success: false, message: 'Failed to process booking' });
        }
        
        // Create booking
        db.query(
          'INSERT INTO bookings (user_id, train_id, pnr_number, journey_date, number_of_passengers, total_fare) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, trainId, pnrNumber, journeyDate, passengers.length, totalFare],
          (err, result) => {
            if (err) {
              return db.rollback(() => {
                console.error('Database error:', err);
                res.status(500).json({ success: false, message: 'Failed to create booking' });
              });
            }
            
            const bookingId = result.insertId;
            
            // Insert passenger details
            const passengerValues = passengers.map(passenger => [
              bookingId,
              passenger.name,
              passenger.age,
              passenger.gender,
              passenger.seatNumber || null
            ]);
            
            const passengerQuery = 'INSERT INTO passengers (booking_id, name, age, gender, seat_number) VALUES ?';
            
            db.query(passengerQuery, [passengerValues], (err) => {
              if (err) {
                return db.rollback(() => {
                  console.error('Database error:', err);
                  res.status(500).json({ success: false, message: 'Failed to add passengers' });
                });
              }
              
              // Update available seats
              db.query(
                'UPDATE trains SET available_seats = available_seats - ? WHERE train_id = ?',
                [passengers.length, trainId],
                (err) => {
                  if (err) {
                    return db.rollback(() => {
                      console.error('Database error:', err);
                      res.status(500).json({ success: false, message: 'Failed to update seats' });
                    });
                  }
                  
                  // Commit transaction
                  db.commit((err) => {
                    if (err) {
                      return db.rollback(() => {
                        console.error('Database error:', err);
                        res.status(500).json({ success: false, message: 'Failed to complete booking' });
                      });
                    }
                    
                    res.status(201).json({
                      success: true,
                      message: 'Booking successful',
                      booking: {
                        bookingId,
                        pnrNumber,
                        totalFare,
                        journeyDate,
                        status: 'Confirmed',
                        passengerCount: passengers.length
                      }
                    });
                  });
                }
              );
            });
          }
        );
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's bookings
app.get('/api/bookings', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    
    const query = `
      SELECT b.*, t.train_name, t.train_number, t.source, t.destination, 
             t.departure_time, t.arrival_time, t.duration
      FROM bookings b
      JOIN trains t ON b.train_id = t.train_id
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC
    `;
    
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
      }
      
      res.json({
        success: true,
        count: results.length,
        data: results
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get booking by ID
app.get('/api/bookings/:id', authenticateToken, (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.userId;
    
    const query = `
      SELECT b.*, t.train_name, t.train_number, t.source, t.destination, 
             t.departure_time, t.arrival_time, t.duration
      FROM bookings b
      JOIN trains t ON b.train_id = t.train_id
      WHERE b.booking_id = ? AND b.user_id = ?
    `;
    
    db.query(query, [bookingId, userId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch booking details' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
      
      const booking = results[0];
      
      // Get passenger details
      db.query(
        'SELECT * FROM passengers WHERE booking_id = ?',
        [booking.booking_id],
        (err, passengerResults) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch passenger details' });
          }
          
          booking.passengers = passengerResults;
          
          res.json({
            success: true,
            data: booking
          });
        }
      );
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Cancel booking
app.put('/api/bookings/:id/cancel', authenticateToken, (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.userId;
    
    // Verify booking belongs to user
    db.query(
      'SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?',
      [bookingId, userId],
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ success: false, message: 'Failed to process cancellation' });
        }
        
        if (results.length === 0) {
          return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        const booking = results[0];
        
        if (booking.status === 'Cancelled') {
          return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
        }
        
        // Check if journey date is in the past
        const journeyDate = new Date(booking.journey_date);
        const currentDate = new Date();
        
        if (journeyDate < currentDate) {
          return res.status(400).json({ 
            success: false, 
            message: 'Cannot cancel past journeys' 
          });
        }
        
        // Begin transaction
        db.beginTransaction((err) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Failed to process cancellation' });
          }
          
          // Update booking status
          db.query(
            'UPDATE bookings SET status = "Cancelled" WHERE booking_id = ?',
            [bookingId],
            (err) => {
              if (err) {
                return db.rollback(() => {
                  console.error('Database error:', err);
                  res.status(500).json({ success: false, message: 'Failed to cancel booking' });
                });
              }
              
              // Update available seats
              db.query(
                'UPDATE trains SET available_seats = available_seats + ? WHERE train_id = ?',
                [booking.number_of_passengers, booking.train_id],
                (err) => {
                  if (err) {
                    return db.rollback(() => {
                      console.error('Database error:', err);
                      res.status(500).json({ success: false, message: 'Failed to update seats' });
                    });
                  }
                  
                  // Commit transaction
                  db.commit((err) => {
                    if (err) {
                      return db.rollback(() => {
                        console.error('Database error:', err);
                        res.status(500).json({ success: false, message: 'Failed to complete cancellation' });
                      });
                    }
                    
                    res.json({
                      success: true,
                      message: 'Booking cancelled successfully'
                    });
                  });
                }
              );
            }
          );
        });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Check PNR status
app.get('/api/bookings/pnr/:pnrNumber', (req, res) => {
  try {
    const pnrNumber = req.params.pnrNumber;
    
    const query = `
      SELECT b.pnr_number, b.journey_date, b.status, b.number_of_passengers,
             t.train_name, t.train_number, t.source, t.destination, 
             t.departure_time, t.arrival_time, t.duration
      FROM bookings b
      JOIN trains t ON b.train_id = t.train_id
      WHERE b.pnr_number = ?
    `;
    
    db.query(query, [pnrNumber], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Failed to check PNR status' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'Invalid PNR number' });
      }
      
      res.json({
        success: true,
        data: results[0]
      });
    });
} catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ========================
// STATION ROUTES
// ========================

// Get all stations
app.get('/api/stations', (req, res) => {
  try {
    db.query('SELECT * FROM stations ORDER BY station_name', (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch stations' });
      }
      
      res.json({
        success: true,
        count: results.length,
        data: results
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Search stations by name or code
app.get('/api/stations/search', (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }
    
    const searchQuery = `
      SELECT * FROM stations 
      WHERE station_name LIKE ? OR station_code LIKE ? OR city LIKE ?
      ORDER BY station_name
      LIMIT 20
    `;
    
    const searchParam = `%${query}%`;
    
    db.query(searchQuery, [searchParam, searchParam, searchParam], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Failed to search stations' });
      }
      
      res.json({
        success: true,
        count: results.length,
        data: results
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});