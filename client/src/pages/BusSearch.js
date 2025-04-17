import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/axiosConfig';

const BusSearch = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    source: '',
    destination: '',
    date: '',
    busType: 'all'
  });
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSwapLocations = () => {
    setSearchParams(prev => ({
      ...prev,
      source: prev.destination,
      destination: prev.source
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use the all-public endpoint instead of search since it's more reliable
      // We'll filter the results on the client side
      const response = await api.get('/api/buses/all-public');
      
      if (response.data && response.data.success) {
        // Filter buses based on search criteria
        let filteredBuses = response.data.data;
        
        // Apply source filter if provided
        if (searchParams.source) {
          const sourceRegex = new RegExp(searchParams.source, 'i');
          filteredBuses = filteredBuses.filter(bus => 
            sourceRegex.test(bus.source)
          );
        }
        
        // Apply destination filter if provided
        if (searchParams.destination) {
          const destRegex = new RegExp(searchParams.destination, 'i');
          filteredBuses = filteredBuses.filter(bus => 
            destRegex.test(bus.destination)
          );
        }
        
        // Apply bus type filter if not 'all'
        if (searchParams.busType && searchParams.busType !== 'all') {
          filteredBuses = filteredBuses.filter(bus => 
            bus.busType === searchParams.busType
          );
        }
        
        setBuses(filteredBuses);
        
        if (filteredBuses.length === 0) {
          toast.info('No buses found for the selected route and date');
        }
      } else {
        setBuses([]);
        toast.error('Failed to fetch buses. Please try again.');
      }
    } catch (error) {
      console.error('Error searching buses:', error);
      setBuses([]);
      toast.error(error.response?.data?.message || 'Failed to search buses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBus = (busId) => {
    navigate(`/select-seats/${busId}`, { state: { ...searchParams } });
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];
  // Get date 30 days from today for max date
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Search Buses</h2>
          <form onSubmit={handleSearch} className="grid grid-cols-1 gap-6 md:grid-cols-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From
              </label>
              <input
                type="text"
                required
                value={searchParams.source}
                onChange={(e) => setSearchParams({ ...searchParams, source: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Enter source city"
              />
            </div>

            {/* Swap Button */}
            <div className="flex items-center justify-center mt-6">
              <button
                type="button"
                onClick={handleSwapLocations}
                className="p-2 rounded-full bg-primary text-white hover:bg-secondary focus:outline-none"
                title="Swap locations"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <input
                type="text"
                required
                value={searchParams.destination}
                onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Enter destination city"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                required
                min={today}
                max={maxDateString}
                value={searchParams.date}
                onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bus Type
              </label>
              <select
                value={searchParams.busType}
                onChange={(e) => setSearchParams({ ...searchParams, busType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="all">All Types</option>
                <option value="AC">AC</option>
                <option value="Non-AC">Non-AC</option>
                <option value="Sleeper">Sleeper</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>

            <div className="md:col-span-5">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </span>
                ) : (
                  'Search Buses'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Bus List */}
        {buses.length > 0 && (
          <div className="grid grid-cols-1 gap-6 mb-8">
            {buses.map((bus) => (
              <div key={bus._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{bus.busNumber}</h3>
                    <p className="text-sm text-gray-600 mt-1">Type: {bus.busType}</p>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-sm text-gray-600">From</div>
                    <div className="font-semibold">{bus.source}</div>
                    <div className="text-sm text-gray-500">{bus.departureTime}</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-sm text-gray-600">To</div>
                    <div className="font-semibold">{bus.destination}</div>
                    <div className="text-sm text-gray-500">{bus.arrivalTime}</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-sm text-gray-600">Available Seats</div>
                    <div className="font-semibold">{bus.availableSeats}</div>
                    <div className="text-xs text-gray-500">
                      Booking: {bus.bookingOpenTime} - {bus.bookingCloseTime}
                    </div>
                  </div>
                  <div className="flex-1 text-right">
                    <button
                      onClick={() => handleSelectBus(bus._id)}
                      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusSearch;
