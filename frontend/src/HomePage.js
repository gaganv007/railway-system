import React, { useState } from 'react';
import { Search, Calendar, Users, MapPin, ArrowRight} from 'lucide-react';

const HomePage = () => {
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [journeyDate, setJourneyDate] = useState('');
  const [passengers, setPassengers] = useState(1);

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to search results page with query parameters
    if (fromStation && toStation && journeyDate) {
      window.location.href = `/trains/search?from=${fromStation}&to=${toStation}&date=${journeyDate}&passengers=${passengers}`;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-green-700 h-48"></div>
        <div className="relative container mx-auto px-4 pt-8 pb-16">
          <div className="text-center text-white mb-8">
            <h1 className="text-4xl font-bold mb-2">Journey with Comfort</h1>
            <p className="text-xl">Book train tickets easily with RailWay</p>
          </div>
          
          {/* Search Box */}
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={fromStation}
                      onChange={(e) => setFromStation(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter city or station"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={toStation}
                      onChange={(e) => setToStation(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter city or station"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Travel Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={journeyDate}
                      onChange={(e) => setJourneyDate(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={passengers}
                      onChange={(e) => setPassengers(parseInt(e.target.value))}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num} Passenger{num !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
              >
                <Search className="h-5 w-5 mr-2" />
                Search Trains
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">Popular Routes</h2>
          <p className="text-gray-600 mt-2">Discover the most traveled train routes</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { from: 'Delhi', to: 'Mumbai', price: '₹1,350', duration: '16h 35m', trains: 25 },
            { from: 'Bangalore', to: 'Chennai', price: '₹750', duration: '5h 10m', trains: 32 },
            { from: 'Kolkata', to: 'Delhi', price: '₹1,500', duration: '17h 20m', trains: 18 },
            { from: 'Mumbai', to: 'Ahmedabad', price: '₹820', duration: '6h 25m', trains: 22 }
          ].map((route, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-lg text-gray-800">{route.from}</span>
                <ArrowRight className="h-5 w-5 text-green-500" />
                <span className="font-medium text-lg text-gray-800">{route.to}</span>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span>Starting from</span>
                <span>Duration</span>
                <span>Trains</span>
              </div>
              
              <div className="flex justify-between font-medium">
                <span className="text-green-600">{route.price}</span>
                <span>{route.duration}</span>
                <span>{route.trains}</span>
              </div>
              
              <button 
                onClick={() => window.location.href = `/trains/search?from=${route.from}&to=${route.to}`}
                className="w-full mt-5 bg-gray-100 hover:bg-gray-200 text-green-600 font-medium py-2 rounded-lg transition-colors"
              >
                Check Trains
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">Our Services</h2>
            <p className="text-gray-600 mt-2">Making your train travel experience seamless</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Ticket Booking', description: 'Book train tickets online for any route with easy payment options.' },
              { title: 'PNR Status', description: 'Check your PNR status to get real-time updates about your booking.' },
              { title: 'Train Schedule', description: 'View complete train schedules including arrival, departure times.' },
              { title: 'Manage Account', description: 'Manage your profile, view booking history and save favorite journeys.' }
            ].map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-green-600 text-xl font-bold">{index + 1}</span>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Updates */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">Latest Updates</h2>
          <p className="text-gray-600 mt-2">Stay informed about the latest news and announcements</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              type: 'Announcement', 
              title: 'Special Trains for Diwali Festival',
              content: 'Railways announces 200 special trains to meet the festive rush during Diwali and Chhath Puja.',
              date: 'October 15, 2025'
            },
            { 
              type: 'New Service', 
              title: 'New Train Service Between Bangalore and Mysore',
              content: 'A new high-speed train service will be operational between Bangalore and Mysore from next month.',
              date: 'October 12, 2025'
            },
            { 
              type: 'Fare Update', 
              title: 'Fare Revision for Premium Trains',
              content: 'Railways announces fare revision for all premium category trains effective from November 1.',
              date: 'October 10, 2025'
            }
          ].map((update, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full mb-3">
                  {update.type}
                </span>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{update.title}</h3>
                <p className="text-gray-600 mb-4">{update.content}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {update.date}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <a href="/updates" className="inline-flex items-center text-green-600 hover:text-green-700 font-medium">
            View all updates
            <svg className="ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
};

export default HomePage;