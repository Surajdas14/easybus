import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'react-toastify';

const BookTicket = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    source: '',
    destination: '',
    date: ''
  });
  const [buses, setBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      
      // We'll log it but NOT override - show what's actually in the database
      // This makes the issue visible so it can be fixed in the admin panel
    }
    
    // Use actual times from the database - no overriding
    const validOpenTime = bookingOpenTime || '00:00';
    const validCloseTime = bookingCloseTime || '23:59';
    
    // Get current time to determine if booking is open
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');
    
    // Check if current time is within booking window
    // For invalid windows (close < open), this will correctly result in "closed"
    const isTimeInWindow = 
      // Handle normal case (open < close)
      (validOpenTime <= validCloseTime && currentTime >= validOpenTime && currentTime <= validCloseTime) ||
      // Handle overnight case (open > close, e.g. 22:00-06:00)
      (validOpenTime > validCloseTime && (currentTime >= validOpenTime || currentTime <= validCloseTime));
    
    const isActive = bus.isActive !== false; // Default to true if not specified
    
    // Calculate the final status
    const calculatedStatus = isActive && isTimeInWindow ? 'open' : 'closed';
    const calculatedMessage = isActive && isTimeInWindow 
      ? 'Booking Open' 
      : isActive 
        ? `Booking available ${validOpenTime}-${validCloseTime}` 
        : 'Bus Inactive';

    return {
      status: status || calculatedStatus,
      message: message || calculatedMessage,
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
        // Filter buses client-side based on search criteria
        let filteredBusData = response.data.data;
        
        // Apply source filter if provided
        if (searchParams.source) {
          const sourceRegex = new RegExp(searchParams.source, 'i');
          filteredBusData = filteredBusData.filter(bus => 
            sourceRegex.test(bus.source)
          );
        }
        
        // Apply destination filter if provided
        if (searchParams.destination) {
          const destRegex = new RegExp(searchParams.destination, 'i');
          filteredBusData = filteredBusData.filter(bus => 
            destRegex.test(bus.destination)
          );
        }
        
        // Add booking status to each bus
        const busesWithStatus = filteredBusData.map(bus => {
          console.log('Processing bus:', bus.busNumber);
          const status = calculateBookingStatus(bus);
          console.log('Calculated status:', status);
          return {
            ...bus,
            bookingStatus: status
          };
        });
        
        console.log('Setting buses:', busesWithStatus);
        setBuses(busesWithStatus);
      } else {
        console.log('API returned success: false');
        setBuses([]);
        toast.error('Failed to fetch buses');
      }
    } catch (error) {
      console.error('Error fetching buses:', error);
      setBuses([]);
      toast.error('Failed to fetch buses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, calculateBookingStatus]);

  // Memoized function to update countdowns
  const updateCountdowns = useCallback(() => {
    setBuses(prevBuses => 
      prevBuses.map(bus => ({
        ...bus,
        bookingStatus: calculateBookingStatus(bus)
      }))
    );
  }, [calculateBookingStatus]);

  // Fetch buses on initial mount and when search params change
  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  // Update countdowns every minute
  useEffect(() => {
    const countdownInterval = setInterval(updateCountdowns, 60000);
    return () => clearInterval(countdownInterval);
  }, [updateCountdowns]);

  const handleSearch = () => {
    fetchBuses();
  };

  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBooking = (bus) => {
    // Check booking status before allowing booking
    if (bus.bookingStatus.status !== 'open') {
      toast.warning(bus.bookingStatus.message);
      return;
    }
    
    // Use current date as default
    const currentDate = new Date().toISOString().split('T')[0];
    navigate(`/select-seats/${bus._id}`, { 
      state: { 
        source: bus.source, 
        destination: bus.destination, 
        date: currentDate,
        busId: bus._id  // Explicitly pass bus ID
      } 
    });
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From
              </label>
              <input
                type="text"
                value={searchParams.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Enter source city"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <input
                type="text"
                value={searchParams.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
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
                min={today}
                max={maxDateString}
                value={searchParams.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              >
                Search Buses
              </button>
            </div>
          </div>
        </div>

        {/* Bus List */}
        {isLoading ? (
          <div className="text-center text-gray-600">Loading buses...</div>
        ) : buses.length === 0 ? (
          <div className="text-center text-gray-600">No buses found</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {buses.map((bus) => {
              // Log bus details for debugging
              console.log('Bus Details:', {
                id: bus._id,
                busNumber: bus.busNumber,
                source: bus.source,
                destination: bus.destination
              });

              return (
                <div 
                  key={bus._id} 
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{bus.busNumber}</h3>
                      <div className="text-sm text-gray-600">
                        {bus.busType} | {bus.seatArrangement} Seating
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        ₹{bus.fareInRupees}
                      </div>
                      <div className="text-sm text-gray-600">
                        {bus.availableSeats || (bus.totalSeats || 40)} seats available
                      </div>
                    </div>
                  </div>

                  {/* Add route information in a more prominent way */}
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
                      <p className="text-xs text-gray-500 mt-1">
                        Booking Hours: {bus.bookingStatus.openTime} - {bus.bookingStatus.closeTime}
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
                      Book Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookTicket;
