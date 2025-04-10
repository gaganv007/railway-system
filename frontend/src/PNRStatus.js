import React, { useState } from 'react';
import { Search, Calendar, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react';

const PNRStatus = () => {
  const [pnrNumber, setPnrNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pnrData, setPnrData] = useState(null);

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

  const handleCheck = async (e) => {
    e.preventDefault();
    
    if (!pnrNumber.trim()) {
      setError('Please enter a valid PNR number');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // API call to backend
      const response = await fetch(`http://localhost:5001/api/bookings/pnr/${pnrNumber}`);
      const data = await response.json();
      
      if (data.success) {
        setPnrData(data.data);
      } else {
        setError(data.message || 'PNR not found. Please check and try again.');
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to check PNR status. Please try again.');
      setLoading(false);
      console.error('Error checking PNR status:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'text-green-600';
      case 'Waiting':
        return 'text-yellow-600';
      case 'Cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Confirmed':
        return <CheckCircle size={24} className="text-green-600" />;
      case 'Waiting':
        return <Clock size={24} className="text-yellow-600" />;
      case 'Cancelled':
        return <XCircle size={24} className="text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="bg-green-700 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">PNR Status</h1>
          <p className="mt-1">Check your booking status with PNR number</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* PNR Input Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <form onSubmit={handleCheck}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="pnr" className="block text-sm font-medium text-gray-700 mb-1">
                    PNR Number
                  </label>
                  <input
                    type="text"
                    id="pnr"
                    value={pnrNumber}
                    onChange={(e) => setPnrNumber(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter 10-digit PNR number"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full md:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center disabled:bg-green-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Checking...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2" size={20} />
                        Check Status
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* PNR Status Result */}
          {pnrData && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-green-50 p-4 border-b border-green-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">PNR: {pnrData.pnr_number}</h2>
                  <div className="flex items-center">
                    {getStatusIcon(pnrData.status)}
                    <span className={`ml-2 font-medium ${getStatusColor(pnrData.status)}`}>
                      {pnrData.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Train Details */}
                <div className="mb-6">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">{pnrData.train_name}</h3>
                  <p className="text-gray-600 text-sm">Train #{pnrData.train_number}</p>
                </div>

                {/* Journey Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-gray-500 text-sm">Journey Date</p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <p className="font-medium">{formatDate(pnrData.journey_date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-gray-500 text-sm">From</p>
                      <p className="font-medium">{pnrData.source}</p>
                      <p className="text-sm text-gray-600">{formatTime(pnrData.departure_time)}</p>
                    </div>
                    
                    <ArrowRight className="mx-2 text-gray-400" size={20} />
                    
                    <div className="flex-1 text-right">
                      <p className="text-gray-500 text-sm">To</p>
                      <p className="font-medium">{pnrData.destination}</p>
                      <p className="text-sm text-gray-600">{formatTime(pnrData.arrival_time)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-500 text-sm">Duration</p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <p className="font-medium">{pnrData.duration}</p>
                    </div>
                  </div>
                </div>
                
                {/* Passenger Details */}
                <div>
                  <h3 className="text-gray-800 font-semibold mb-3">Passenger Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600">{pnrData.number_of_passengers} Passenger{pnrData.number_of_passengers !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              For any assistance, please contact our customer support at <a href="tel:18001234567" className="text-green-600 font-medium">1800-123-4567</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PNRStatus;