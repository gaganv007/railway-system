import React, { useState, useEffect } from 'react';
import { ArrowRight, Clock, Calendar, Filter, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const SearchResults = () => {
  // Get query parameters from URL
  const urlParams = new URLSearchParams(window.location.search);
  const from = urlParams.get('from');
  const to = urlParams.get('to');
  const date = urlParams.get('date');
  const passengers = urlParams.get('passengers') || 1;
  
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    showFilters: false,
    minPrice: 0,
    maxPrice: 5000,
    departureTime: 'all', // 'morning', 'afternoon', 'evening', 'night'
    trainClass: 'all' // 'sleeper', 'ac3', 'ac2', 'ac1', 'general'
  });

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        setLoading(true);
        
        // Check if required parameters are present
        if (!from || !to) {
          setError('Please specify both source and destination stations.');
          setLoading(false);
          return;
        }
        
        // API call to backend
        const response = await fetch(`http://localhost:5001/api/trains/search?source=${from}&destination=${to}&date=${date}`);
        const data = await response.json();
        
        if (data.success) {
          setTrains(data.data);
        } else {
          setError(data.message || 'Failed to fetch trains');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching trains:', err);
        setError('Failed to fetch trains. Please try again.');
        setLoading(false);
      }
    };

    fetchTrains();
  }, [from, to, date]);

  // Filter trains based on user selection
  const filteredTrains = trains.filter(train => {
    // Price filter
    const price = parseFloat(train.fare);
    if (price < filters.minPrice || price > filters.maxPrice) {
      return false;
    }

    // Class filter
    if (filters.trainClass !== 'all') {
      const classMap = {
        'sleeper': 'Sleeper',
        'ac3': 'AC 3 Tier',
        'ac2': 'AC 2 Tier',
        'ac1': 'AC 1 Tier',
        'general': 'General'
      };
      
      if (train.class_type !== classMap[filters.trainClass]) {
        return false;
      }
    }

    // Departure time filter
    if (filters.departureTime !== 'all') {
      const hour = parseInt(train.departure_time.split(':')[0]);
      
      switch (filters.departureTime) {
        case 'morning': // 4 AM - 11:59 AM
          if (hour < 4 || hour >= 12) return false;
          break;
        case 'afternoon': // 12 PM - 3:59 PM
          if (hour < 12 || hour >= 16) return false;
          break;
        case 'evening': // 4 PM - 7:59 PM
          if (hour < 16 || hour >= 20) return false;
          break;
        case 'night': // 8 PM - 3:59 AM
          if (hour >= 4 && hour < 20) return false;
          break;
        default:
          break;
      }
    }

    return true;
  });

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

  // Handle booking a train
  const handleBooking = (trainId) => {
    // Check if user is logged in by looking for token in localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Redirect to login if user is not authenticated
      window.location.href = `/login?redirect=/booking&trainId=${trainId}&date=${date}`;
    } else {
      // Redirect to booking page
      window.location.href = `/booking?trainId=${trainId}&date=${date}&passengers=${passengers}`;
    }
  };

  const toggleFilters = () => {
    setFilters(prev => ({
      ...prev,
      showFilters: !prev.showFilters
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Search Summary */}
      <div className="bg-green-700 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="text-lg font-medium">
                <span>{from}</span>
                <ArrowRight className="inline mx-3" size={20} />
                <span>{to}</span>
              </div>
            </div>
            {date && (
              <div className="flex items-center">
                <Calendar className="mr-2" size={18} />
                <span>{formatDate(date)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-6">
        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer"
            onClick={toggleFilters}
          >
            <div className="flex items-center">
              <Filter className="mr-2 text-green-600" size={20} />
              <span className="font-medium">Filters</span>
            </div>
            {filters.showFilters ? (
              <ChevronUp className="text-gray-600" size={20} />
            ) : (
              <ChevronDown className="text-gray-600" size={20} />
            )}
          </div>

          {filters.showFilters && (
            <div className="p-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (₹{filters.minPrice} - ₹{filters.maxPrice})
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      name="minPrice"
                      min="0"
                      max="5000"
                      step="100"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      className="w-full"
                    />
                    <input
                      type="range"
                      name="maxPrice"
                      min="0"
                      max="5000"
                      step="100"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Departure Time Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure Time
                  </label>
                  <select
                    name="departureTime"
                    value={filters.departureTime}
                    onChange={handleFilterChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">All Times</option>
                    <option value="morning">Morning (4 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                    <option value="evening">Evening (4 PM - 8 PM)</option>
                    <option value="night">Night (8 PM - 4 AM)</option>
                  </select>
                </div>

                {/* Train Class Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Train Class
                  </label>
                  <select
                    name="trainClass"
                    value={filters.trainClass}
                    onChange={handleFilterChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">All Classes</option>
                    <option value="sleeper">Sleeper</option>
                    <option value="ac3">AC 3 Tier</option>
                    <option value="ac2">AC 2 Tier</option>
                    <option value="ac1">AC 1 Tier</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {loading ? 'Searching trains...' : 
             error ? 'Error' :
             `${filteredTrains.length} Trains Found`}
          </h2>

          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
              <p className="text-gray-600">Searching for trains...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="flex justify-center mb-3">
                <AlertCircle className="text-red-500" size={48} />
              </div>
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredTrains.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">No trains found for this route and date.</p>
            </div>
          ) : (
            filteredTrains.map(train => (
              <div key={train.train_id} className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{train.train_name}</h3>
                      <p className="text-gray-600 text-sm">Train #{train.train_number}</p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {train.class_type}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Departure */}
                    <div>
                      <p className="text-gray-500 text-sm">Departure</p>
                      <p className="text-lg font-medium text-gray-900">{formatTime(train.departure_time)}</p>
                      <p className="text-gray-600">{train.source}</p>
                    </div>

                    {/* Duration */}
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-gray-500 text-sm">Duration</p>
                      <div className="flex items-center">
                        <Clock className="text-gray-400 mr-1" size={16} />
                        <span className="text-gray-600">{train.duration}</span>
                      </div>
                    </div>

                    {/* Arrival */}
                    <div>
                      <p className="text-gray-500 text-sm">Arrival</p>
                      <p className="text-lg font-medium text-gray-900">{formatTime(train.arrival_time)}</p>
                      <p className="text-gray-600">{train.destination}</p>
                    </div>

                    {/* Price & Book Button */}
                    <div className="flex flex-col justify-center items-end">
                      <div className="mb-2">
                        <p className="text-gray-500 text-sm">Starting from</p>
                        <p className="text-xl font-bold text-green-600 flex items-center">
                          <span className="text-sm mr-1">₹</span>
                          {train.fare}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleBooking(train.train_id)}
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                  
                  {/* Train Details - Available Seats */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-sm">
                          <span className="font-medium">{train.available_seats}</span> seats available
                        </span>
                      </div>
                      <div>
                        <button 
                          onClick={() => window.location.href = `/trains/${train.train_id}`}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;