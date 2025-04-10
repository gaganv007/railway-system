import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowRight, User, CreditCard, Save, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

const BookingForm = () => {
  // Get query parameters from URL
  const urlParams = new URLSearchParams(window.location.search);
  const trainId = urlParams.get('trainId');
  const journeyDate = urlParams.get('date');
  const passengerCount = parseInt(urlParams.get('passengers') || '1');
  
  const [train, setTrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [passengers, setPassengers] = useState(
    Array(passengerCount).fill().map(() => ({ name: '', age: '', gender: 'Male' }))
  );
  
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Check if user is logged in
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!token) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }

    const fetchTrainDetails = async () => {
      try {
        setLoading(true);
        
        // API call to backend
        const response = await fetch(`http://localhost:5001/api/trains/${trainId}`);
        const data = await response.json();
        
        if (data.success) {
          setTrain(data.data);
        } else {
          setError(data.message || 'Failed to fetch train details');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching train details:', err);
        setError('Failed to fetch train details. Please try again.');
        setLoading(false);
      }
    };

    if (trainId) {
      fetchTrainDetails();
    } else {
      setError('Train ID is required to proceed with booking.');
      setLoading(false);
    }
  }, [trainId, token]);

  // Format time (00:00:00 to 00:00 AM/PM)
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    
    return `${formattedHour}:${minutes} ${period}`;
  };

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

  // Handle passenger input changes
  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value
    };
    setPassengers(updatedPassengers);
  };

  // Add a new passenger
  const addPassenger = () => {
    if (passengers.length < 6) { // Limit to 6 passengers
      setPassengers([...passengers, { name: '', age: '', gender: 'Male' }]);
    }
  };

  // Remove a passenger
  const removePassenger = (index) => {
    if (passengers.length > 1) { // Keep at least one passenger
      const updatedPassengers = [...passengers];
      updatedPassengers.splice(index, 1);
      setPassengers(updatedPassengers);
    }
  };

  // Calculate total fare
  const calculateTotalFare = () => {
    if (!train) return 0;
    return train.fare * passengers.length;
  };

  // Validate form
  const validateForm = () => {
    // Check if all passengers have name and age
    const isValidPassengers = passengers.every(
      passenger => passenger.name.trim() !== '' && passenger.age.trim() !== ''
    );
    
    // Check if age is between 1 and 120
    const isValidAge = passengers.every(
      passenger => {
        const age = parseInt(passenger.age);
        return !isNaN(age) && age >= 1 && age <= 120;
      }
    );
    
    return isValidPassengers && isValidAge;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fill all passenger details correctly.');
      return;
    }
    
    try {
      setBookingInProgress(true);
      setError(null);
      
      // API call to backend
      const response = await fetch('http://localhost:5001/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          trainId,
          journeyDate,
          passengers: passengers.map(p => ({
            name: p.name,
            age: parseInt(p.age),
            gender: p.gender
          }))
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBookingSuccess(data);
        
        // Redirect to booking confirmation page after 2 seconds
        setTimeout(() => {
          window.location.href = `/booking/confirmation/${data.booking.pnrNumber}`;
        }, 2000);
      } else {
        setError(data.message || 'Failed to book tickets');
      }
      
      setBookingInProgress(false);
    } catch (err) {
      setBookingInProgress(false);
      setError('Failed to book tickets. Please try again.');
      console.error('Error booking tickets:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading train details...</p>
        </div>
      </div>
    );
  }

  if (error && !train) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex justify-center mb-4">
            <AlertCircle className="text-red-500" size={48} />
          </div>
          <p className="text-red-600 text-center mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-green-600 text-white py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="text-green-500" size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Successful!</h2>
          <p className="text-gray-600 mb-4">Your PNR number is: <span className="font-bold">{bookingSuccess.booking.pnrNumber}</span></p>
          <p className="text-gray-600">Redirecting to confirmation page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="bg-green-700 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Complete Your Booking</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Train Details */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Train Details</h2>
                
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-800">{train.train_name}</h3>
                  <p className="text-gray-600 text-sm">Train #{train.train_number}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Journey Date */}
                  <div className="flex items-center">
                    <Calendar className="text-gray-400 mr-2" size={20} />
                    <div>
                      <p className="text-gray-500 text-sm">Journey Date</p>
                      <p className="font-medium">{formatDate(journeyDate)}</p>
                    </div>
                  </div>
                  
                  {/* From - To */}
                  <div className="flex items-center col-span-2">
                    <div className="flex-1">
                      <p className="text-gray-500 text-sm">From</p>
                      <p className="font-medium">{train.source}</p>
                      <p className="text-sm text-gray-600">{formatTime(train.departure_time)}</p>
                    </div>
                    
                    <ArrowRight className="mx-4 text-gray-400" size={20} />
                    
                    <div className="flex-1">
                      <p className="text-gray-500 text-sm">To</p>
                      <p className="font-medium">{train.destination}</p>
                      <p className="text-sm text-gray-600">{formatTime(train.arrival_time)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="text-gray-400 mr-2" size={18} />
                  <span className="text-gray-600">Duration: {train.duration}</span>
                </div>
              </div>
              
              {/* Passenger Details */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Passenger Details</h2>
                  
                  <button 
                    type="button"
                    onClick={addPassenger}
                    className="text-green-600 hover:text-green-800 flex items-center text-sm font-medium"
                    disabled={passengers.length >= 6}
                  >
                    <Plus size={16} className="mr-1" />
                    Add Passenger
                  </button>
                </div>
                
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 flex items-start">
                    <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
                
                {passengers.map((passenger, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-800">Passenger {index + 1}</h3>
                      
                      {passengers.length > 1 && (
                        <button 
                        type="button"
                        onClick={() => removePassenger(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={passenger.name}
                        onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter passenger name"
                        required
                      />
                    </div>
                    
                    {/* Age */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={passenger.age}
                        onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter age"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={passenger.gender}
                      onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Payment Options */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="mr-3 text-green-600"
                  />
                  <span>UPI Payment</span>
                </label>
                
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="mr-3 text-green-600"
                  />
                  <span>Credit/Debit Card</span>
                </label>
                
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="netbanking"
                    checked={paymentMethod === 'netbanking'}
                    onChange={() => setPaymentMethod('netbanking')}
                    className="mr-3 text-green-600"
                  />
                  <span>Net Banking</span>
                </label>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center disabled:bg-green-300"
              disabled={bookingInProgress}
            >
              {bookingInProgress ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2" size={20} />
                  Pay & Confirm Booking
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Fare Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Fare Summary</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Fare (x{passengers.length})</span>
                <span>₹{train ? train.fare * passengers.length : 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Reservation Charges</span>
                <span>₹30</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Convenience Fee</span>
                <span>₹15</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount</span>
                <span>₹{calculateTotalFare() + 45}</span>
              </div>
            </div>
            
            <div className="mt-6 text-sm text-gray-600">
              <p className="flex items-center mb-2">
                <User size={16} className="mr-2 text-green-600" />
                <span>{passengers.length} {passengers.length === 1 ? 'Passenger' : 'Passengers'}</span>
              </p>
              
              <p className="flex items-center">
                <Save size={16} className="mr-2 text-green-600" />
                <span>Free Cancellation before 24 hours of departure</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default BookingForm; 