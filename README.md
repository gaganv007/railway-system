# Railway Ticketing System:

A simple and complete railway ticketing system with a modern UI, built for educational purposes. This project demonstrates a full-stack application using React for the frontend and Node.js with MySQL for the backend.
Features
```
User authentication (signup/login)
Train search with filters
Ticket booking system
PNR status checking
Booking management (view/cancel)
Responsive design for all devices
```

# Tech Stack
```
Frontend: React, React Router, Tailwind CSS
Backend: Node.js, Express
Database: MySQL
Authentication: JWT
```

# Quick Start Guide
# Prerequisites
```
Node.js (v14+)
MySQL
```
# Installation
1. Clone the repository
```
git clone https://github.com/yourusername/railway-ticketing-system.git
```
```
cd railway--system
```
2. Set up the backend
Navigate to backend directory
```
cd backend
```

# Install dependencies
```
npm install
```

# Create .env file with your database credentials
```
echo "PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=railway_system
JWT_SECRET=your_secret_key" > .env
```

# Create database and tables
```
mysql -u root -p < database.sql
```

# Start the server
```
npm start
```
3. Set up the frontend
Navigate to the frontend directory
```
cd ../frontend
```

# Install dependencies
```
npm install
```
# Start the development server
```
npm start
The application should now be running at http://localhost:3000
```
```
Project Structure
railway-system/
├── backend/              # Node.js backend
│   ├── database.sql      # Database setup
│   └── server.js         # Express server
│
└── frontend/             # React frontend
    ├── src/
    │   ├── App.js        # Main component with routing
    │   ├── HomePage.js   # Home page component
    │   ├── SearchResults.js # Train search component
    │   ├── BookingForm.js   # Booking form component
    │   ├── PNRStatus.js    # PNR status checker
    │   └── styles.css     # Styles using Tailwind
    └── public/ index.html
```
Database Schema
```
users: User authentication information
trains: Train details including routes, timings
bookings: Booking information with PNR
passengers: Passenger details for each booking
stations: Station information
```
API Endpoints
Authentication
```
POST /api/auth/register: Create a new user
POST /api/auth/login: User login
```
Trains
```
GET /api/trains: Get all trains
GET /api/trains/search: Search trains by source/destination
```
Bookings
```
POST /api/bookings: Create a new booking
GET /api/bookings: Get user's bookings
PUT /api/bookings/:id/cancel: Cancel a booking
GET /api/bookings/pnr/:pnrNumber: Check PNR status
```
Usage
```
Register a new account or log in
Search for trains by entering source, destination, and date
Choose a train from the search results
Enter passenger details and make payment
View the booking confirmation with PNR
Check booking status or cancel from the "My Bookings" page
```
