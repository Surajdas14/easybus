import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';

const AgentBooking = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    source: '',
    destination: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [buses, setBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Popular cities for quick selection
  const popularCities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'];

  // Check if agent is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user || !user.id || user.role !== 'agent') {
      toast.error('Please log in to access agent booking');
      navigate('/agent-login');
      return;
    }
  }, [navigate]);

  // Memoized function to calculate booking status
  const calculateBookingStatus = useCallback((bus) => {
    // Default to a closed status if booking details are missing
    if (!bus.bookingDetails) {
      return {
        status: 'closed',
        message: 'Booking Unavailable',
        openTime: 'N/A',
        closeTime: 'N/A'
      };
    }

    // Use the booking details from the server
    let { bookingOpenTime, bookingCloseTime, status, message } = bus.bookingDetails;
    
    // ONLY handle invalid booking time windows (where closing time is before opening time)
    if (bookingCloseTime && bookingOpenTime && bookingCloseTime < bookingOpenTime) {
      console.log(`Detected invalid booking window for bus ${bus.busNumber}: ${bookingOpenTime}-${bookingCloseTime}`);
      console.log('This is likely an error in the database. The booking window should not end before it starts.');
    }
    
    // Use actual times from the database - no overriding
    const validOpenTime = bookingOpenTime || '00:00';
    const validCloseTime = bookingCloseTime || '23:59';
    
    // Get current time to determine if booking is open
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');
    
    // Check if current time is within booking window
    const isTimeInWindow = 
      // Handle normal case (open < close)
      (validOpenTime <= validCloseTime && currentTime >= validOpenTime && currentTime <= validCloseTime) ||
      // Handle overnight case (open > close, e.g. 22:00-06:00)
      (validOpenTime > validCloseTime && (currentTime >= validOpenTime || currentTime <= validCloseTime));
    
    const isActive = bus.isActive !== false; // Default to true if not specified
    
    // For agents, extend booking hours - they can book even outside normal hours
    const isAgent = true; // This is always true in agent booking
    const calculatedStatus = isActive && (isTimeInWindow || isAgent) ? 'open' : 'closed';
    const calculatedMessage = isActive && isTimeInWindow 
      ? 'Booking Open' 
      : isActive && isAgent
        ? 'Agent Booking Available'
        : 'Bus Inactive';

    return {
      status: calculatedStatus,
      message: calculatedMessage,
      openTime: validOpenTime,
      closeTime: validCloseTime
    };
  }, []);

  // Memoized function to fetch buses - using the all-public endpoint with client-side filtering
  const fetchBuses = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Fetching buses with params:', searchParams);
      
      // Use the more reliable all-public endpoint instead of search
      const response = await axios.get('/buses/all-public');
      console.log('API Response:', response.data);
      
      if (response.data && response.data.success) {
        // Get all buses without filtering initially
        let filteredBusData = response.data.data;
        
        // Only apply filtering if a search has been performed
        if (searchPerformed) {
          if (searchParams.source && searchParams.source.trim() !== '') {
            filteredBusData = filteredBusData.filter(bus => 
              bus.source.toLowerCase().includes(searchParams.source.toLowerCase())
            );
          }
          
          if (searchParams.destination && searchParams.destination.trim() !== '') {
            filteredBusData = filteredBusData.filter(bus => 
              bus.destination.toLowerCase().includes(searchParams.destination.toLowerCase())
            );
          }
          
          if (searchParams.date && searchParams.date.trim() !== '') {
            // Format the date for comparison (YYYY-MM-DD)
            const formattedDate = new Date(searchParams.date).toISOString().split('T')[0];
            filteredBusData = filteredBusData.filter(bus => {
              // Make sure the departure date is consistent
              const busDepartureDate = bus.departureDate || bus.date;
              if (!busDepartureDate) return true; // Keep if no date information
              return busDepartureDate === formattedDate;
            });
          }
        }
        
        console.log('Filtered bus data:', filteredBusData);
        
        // Process each bus to add booking status and commission information
        const processedBuses = filteredBusData.map(bus => {
          // Calculate booking status
          const bookingStatus = calculateBookingStatus(bus);
          
          // Calculate commission (10% by default if not specified)
          const commissionRate = (bus.agentCommissionRate || 10) / 100; // Convert percentage to decimal
          const fareAmount = parseFloat(bus.fareInRupees) || 0;
          const commissionAmount = Math.round(fareAmount * commissionRate);
          
          return {
            ...bus,
            bookingStatus,
            commission: {
              rate: commissionRate * 100, // Store as percentage
              amount: commissionAmount
            }
          };
        });
        
        setBuses(processedBuses);
      } else {
        console.error('Failed to fetch buses:', response.data?.message || 'Unknown error');
        toast.error('Failed to fetch buses. Please try again.');
        setBuses([]);
      }
    } catch (error) {
      console.error('Error fetching buses:', error);
      toast.error('Failed to connect to server. Please try again later.');
      setBuses([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, searchPerformed, calculateBookingStatus]);

  // Fetch buses automatically on page load
  useEffect(() => {
    const loadInitialBuses = async () => {
      await fetchBuses();
      console.log("Initial buses loaded");
    };
    
    loadInitialBuses();
  }, [fetchBuses]);

  // Search for buses when form is submitted
  const handleSearch = () => {
    if (!searchParams.source || !searchParams.destination || !searchParams.date) {
      toast.error('Please fill in all search fields');
      return;
    }
    
    fetchBuses();
    setSearchPerformed(true);
  };

  // Update search parameters when input changes
  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle selecting a city from the popular cities list
  const selectCity = (type, city) => {
    setSearchParams({
      ...searchParams,
      [type]: city
    });
  };

  // Handle booking a bus
  const handleBooking = (bus) => {
    navigate('/agent/select-seats', {
      state: {
        busId: bus._id,
        source: searchParams.source || bus.source,
        destination: searchParams.destination || bus.destination,
        date: searchParams.date,
        fareInRupees: bus.fareInRupees,
        busNumber: bus.busNumber,
        departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime,
        commission: bus.commission
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Agent Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-3xl text-primary mr-3">
                <i className="fas fa-bus"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Agent Booking</h1>
                <p className="text-sm text-gray-600">Book tickets for your customers</p>
              </div>
            </div>
            <div>
              <button
                onClick={() => navigate('/agent/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Search for Buses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:ring-primary focus:border-primary"
                placeholder="Departure City"
                value={searchParams.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {popularCities.slice(0, 4).map(city => (
                  <button
                    key={`source-${city}`}
                    onClick={() => selectCity('source', city)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:ring-primary focus:border-primary"
                placeholder="Destination City"
                value={searchParams.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {popularCities.slice(0, 4).map(city => (
                  <button
                    key={`destination-${city}`}
                    onClick={() => selectCity('destination', city)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded focus:ring-primary focus:border-primary"
                value={searchParams.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <div className="mt-4">
                <button
                  className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded font-medium"
                  onClick={handleSearch}
                >
                  Search Buses
                </button>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching for buses...</p>
          </div>
        ) : (
          <div>
            {buses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl text-gray-300 mb-4">🚌</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Buses Found</h3>
                <p className="text-gray-500">
                  {searchPerformed 
                    ? "We couldn't find any buses matching your search criteria. Please try different search parameters." 
                    : "Buses will appear here. Please search for your desired route."}
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  {searchPerformed 
                    ? `Found ${buses.length} bus${buses.length !== 1 ? 'es' : ''} for your search` 
                    : `Available Buses (${buses.length})`}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                  {buses.map((bus) => (
                    <div
                      key={bus._id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{bus.busNumber}</h3>
                          <div className="text-sm text-gray-600">
                            {bus.busType} | {bus.seatArrangement || 'Standard'} Seating
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            ₹{bus.fareInRupees}
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            ₹{bus.commission.amount} commission
                          </div>
                        </div>
                      </div>

                      {/* Route information */}
                      <div className="flex items-center justify-center mb-4 bg-gray-50 py-3 rounded-lg">
                        <div className="flex items-center">
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{bus.source}</div>
                            <div className="text-xs text-gray-600">Source</div>
                          </div>
                          
                          <div className="mx-4 text-gray-400 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </div>
                          
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{bus.destination}</div>
                            <div className="text-xs text-gray-600">Destination</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center border-t pt-4">
                        <div>
                          <span className="text-sm text-gray-600">Departure</span>
                          <p className="font-medium">{bus.departureTime}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Arrival</span>
                          <p className="font-medium">{bus.arrivalTime}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Status</span>
                          <p 
                            className={`font-medium ${
                              bus.bookingStatus.status === 'open' 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}
                          >
                            {bus.bookingStatus.message}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 text-center">
                        <button
                          onClick={() => handleBooking(bus)}
                          disabled={bus.bookingStatus.status !== 'open'}
                          className={`w-full py-2 rounded-md text-white font-medium ${
                            bus.bookingStatus.status === 'open'
                              ? 'bg-primary hover:bg-primary-dark'
                              : 'bg-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Book for Customer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentBooking;
