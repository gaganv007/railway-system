// App.js - Main Application Component

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import SearchResults from './SearchResults';
import BookingForm from './BookingForm';
import PNRStatus from './PNRStatus';
import TrainsPage from './TrainsPage';
import './styles.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token validity
      fetch('http://localhost:5001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setIsAuthenticated(true);
            setUser(data.user);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('token');
          }
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Login handler
  const handleLogin = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        setIsAuthenticated(true);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  // Register handler
  const handleRegister = async (name, email, password, contactNumber) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, contactNumber })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        setIsAuthenticated(true);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div className="loading">Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    return children;
  };

  // Login component
  const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      
      const result = await handleLogin(email, password);
      
      if (!result.success) {
        setError(result.message);
      }
      
      setLoading(false);
    };
    
    if (isAuthenticated) {
      return <Navigate to="/" />;
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/register" className="font-medium text-green-600 hover:text-green-500">
                  Sign up
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Register component
  const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      
      const result = await handleRegister(name, email, password, contactNumber);
      
      if (!result.success) {
        setError(result.message);
      }
      
      setLoading(false);
    };
    
    if (isAuthenticated) {
      return <Navigate to="/" />;
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create a new account</h2>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="name" className="sr-only">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="contact-number" className="sr-only">Contact Number</label>
                <input
                  id="contact-number"
                  name="contactNumber"
                  type="tel"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Contact Number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-green-600 hover:text-green-500">
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Header component
  const Header = () => {
    return (
      <header className="bg-green-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <span className="text-green-700 font-bold text-xl">R</span>
            </div>
            <span className="font-bold text-2xl">RailWay</span>
          </a>
          
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="font-medium hover:text-green-200">Home</a>
            <a href="/trains" className="font-medium hover:text-green-200">Trains</a> 
            <a href="/pnr" className="font-medium hover:text-green-200">PNR Status</a>
            {isAuthenticated && (
              <a href="/bookings" className="font-medium hover:text-green-200">My Bookings</a>
            )}
          </nav>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="hidden md:inline text-sm">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <a href="/login" className="bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50">
                Login
              </a>
            )}
          </div>
        </div>
      </header>
    );
  };

  // Footer component
  const Footer = () => {
    return (
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <span className="text-green-700 font-bold text-sm">R</span>
                </div>
                <span className="font-bold text-xl">RailWay</span>
              </div>
              <p className="text-gray-400">Making train travel simple and convenient for everyone.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">Services</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-400 hover:text-white">Train Booking</a></li>
                <li><a href="/" className="text-gray-400 hover:text-white">PNR Status</a></li>
                <li><a href="/" className="text-gray-400 hover:text-white">Train Schedule</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-400 hover:text-white">Help Center</a></li>
                <li><a href="/" className="text-gray-400 hover:text-white">Contact Us</a></li>
                <li><a href="/" className="text-gray-400 hover:text-white">FAQs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-400 hover:text-white">About</a></li>
                <li><a href="/" className="text-gray-400 hover:text-white">Terms</a></li>
                <li><a href="/" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    );
  };

  // Layout component
  const Layout = ({ children }) => {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    );
  };

  // Main app routes
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
          <Layout>
            <HomePage />
          </Layout>
        } />
        <Route path="/trains" element={
          <Layout>
            <TrainsPage />
          </Layout>
        } />
        
        <Route path="/trains/search" element={
          <Layout>
            <SearchResults />
          </Layout>
        } />
        
        <Route path="/booking" element={
          <Layout>
            <ProtectedRoute>
              <BookingForm />
            </ProtectedRoute>
          </Layout>
        } />
        
        <Route path="/pnr" element={
          <Layout>
            <PNRStatus />
          </Layout>
        } />
        
        <Route path="/booking/confirmation/:pnrNumber" element={
          <Layout>
            <ProtectedRoute>
              <BookingConfirmation />
            </ProtectedRoute>
          </Layout>
        } />
        
        <Route path="/bookings" element={
          <Layout>
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          </Layout>
        } />
        
        <Route path="*" element={
          <Layout>
            <NotFound />
          </Layout>
        } />
      </Routes>
    </Router>
  );
};

// Booking Confirmation component
const BookingConfirmation = () => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const params = window.location.pathname.split('/');
  const pnrNumber = params[params.length - 1];
  
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/bookings/pnr/${pnrNumber}`);
        const data = await response.json();
        
        if (data.success) {
          setBooking(data.data);
        } else {
          setError(data.message || 'Failed to fetch booking details');
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch booking details. Please try again.');
        setLoading(false);
      }
    };
    
    fetchBooking();
  }, [pnrNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <svg className="h-16 w-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mt-4">Error</h2>
            <p className="text-gray-600 mt-2">{error}</p>
          </div>
          <div className="text-center">
            <a
              href="/"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  // Format date (YYYY-MM-DD to Month Day, Year)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time (00:00:00 to 00:00 AM/PM)
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    
    return `${formattedHour}:${minutes} ${period}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mt-2">Your ticket has been booked successfully.</p>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800">PNR Number</h3>
            <span className="text-xl font-bold text-green-600">{booking.pnr_number}</span>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">{booking.train_name}</h4>
              <p className="text-gray-500 text-sm">Train #{booking.train_number}</p>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">From</p>
                <p className="font-medium">{booking.source}</p>
                <p className="text-sm text-gray-600">{formatTime(booking.departure_time)}</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-20 h-0.5 bg-gray-300 mb-1"></div>
                <span className="text-sm text-gray-500">{booking.duration}</span>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">To</p>
                <p className="font-medium">{booking.destination}</p>
                <p className="text-sm text-gray-600">{formatTime(booking.arrival_time)}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-2">Journey Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(booking.journey_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Passengers</p>
                <p className="font-medium">{booking.number_of_passengers}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Total Amount</span>
              <span className="text-xl font-bold text-green-600">₹{booking.total_fare}</span>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <a
            href="/bookings"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 mr-4"
          >
            My Bookings
          </a>
          <a
            href="/"
            className="inline-block bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
};

// My Bookings component
const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:5001/api/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setBookings(data.data);
        } else {
          setError(data.message || 'Failed to fetch bookings');
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch bookings. Please try again.');
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5001/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update booking status in the UI
        setBookings(bookings.map(booking => 
          booking.booking_id === bookingId 
            ? { ...booking, status: 'Cancelled' } 
            : booking
        ));
        
        alert('Booking cancelled successfully');
      } else {
        alert(data.message || 'Failed to cancel booking');
      }
    } catch (err) {
      alert('Failed to cancel booking. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  // Format date (YYYY-MM-DD to Month Day, Year)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
          <p className="mt-1 text-gray-500">You haven't made any bookings yet.</p>
          <div className="mt-6">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              Book a ticket
            </a>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map(booking => (
            <div key={booking.booking_id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{booking.train_name}</h3>
                    <p className="text-gray-600 text-sm">PNR: {booking.pnr_number}</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Waiting' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">From</p>
                    <p className="font-medium">{booking.source}</p>
                  </div>
                  
                  <div className="hidden md:block">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">To</p>
                    <p className="font-medium">{booking.destination}</p>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Journey Date</p>
                    <p className="font-medium">{formatDate(booking.journey_date)}</p>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Passengers</p>
                    <p className="font-medium">{booking.number_of_passengers}</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <p className="text-gray-700"><span className="font-medium">Total Fare:</span> ₹{booking.total_fare}</p>
                  
                  {booking.status === 'Confirmed' && (
                    <button
                      onClick={() => cancelBooking(booking.booking_id)}
                      className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Not Found component
const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">404</h2>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <p className="text-gray-500 mb-6">The page you are looking for doesn't exist or has been moved.</p>
      <a href="/" className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg">
        Go Home
      </a>
    </div>
  );
};

export default App;