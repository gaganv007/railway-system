// src/TrainsPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const TrainsPage = () => {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/api/trains');
        const data = await response.json();
        
        if (data.success) {
          setTrains(data.data);
        } else {
          setError(data.message || 'Failed to fetch trains');
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch trains. Please try again.');
        setLoading(false);
      }
    };

    fetchTrains();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">All Trains</h1>
      
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trains...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {trains.map(train => (
            <div key={train.train_id} className="bg-white rounded-lg shadow-md overflow-hidden">
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">From</p>
                    <p className="font-medium">{train.source}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500 text-sm">To</p>
                    <p className="font-medium">{train.destination}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500 text-sm">Fare</p>
                    <p className="font-medium text-green-600">₹{train.fare}</p>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Link 
                    to={`/trains/search?from=${train.source}&to=${train.destination}`}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium"
                  >
                    View Schedule
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainsPage;