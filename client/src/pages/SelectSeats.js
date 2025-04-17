import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'react-toastify';

const SelectSeats = () => {
  const { busId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [bus, setBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [error, setError] = useState(null);
  
  // Get travel date from location state or default to today
  const [travelDate] = useState(location.state?.date || new Date().toISOString().split('T')[0]);

  // Create a normalized version of booked seats for consistent comparison
  const normalizedBookedSeats = bookedSeats.map(seat => seat.toString());
  
  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        console.log('Fetching bus details with:', {
          busId,
          locationState: location.state,
          travelDate
        });

        if (!busId && !location.state?.busId) {
          setError('No bus ID provided');
          setLoading(false);
          return;
        }

        const actualBusId = busId || location.state?.busId;
        console.log('Making request to get bus details for ID:', actualBusId);
        
        // Make a simple request with the updated axios config
        const response = await axios.get(`/buses/${actualBusId}`);
        console.log('Bus details response:', response.data);
        
        if (response.data.success) {
          setBus(response.data.data);
          
          // Fetch booked seats with the correct URL format
          const bookingsResponse = await axios.get(`/bookings/bus/${actualBusId}/date/${travelDate}`);
          console.log('Bookings response:', bookingsResponse.data);
          
          if (bookingsResponse.data.success) {
            console.log('Setting booked seats:', bookingsResponse.data.bookedSeats);
            setBookedSeats(bookingsResponse.data.bookedSeats || []);
          }
        } else {
          setError(response.data.message || 'Failed to fetch bus details');
        }
      } catch (error) {
        console.error('Error fetching bus details:', error);
        // Provide more detailed error information
        let errorMessage = 'Failed to load bus details. Please try again.';
        if (error.response) {
          errorMessage += ` Server responded with: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`;
        } else if (error.request) {
          errorMessage += ' No response received from server.';
        } else {
          errorMessage += ` ${error.message}`;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBusDetails();
  }, [busId, location.state, travelDate]);

  const handleSeatClick = (seatNumber) => {
    // Don't allow clicking on already booked seats
    if (normalizedBookedSeats.includes(seatNumber.toString())) {
      toast.error(`Seat ${seatNumber} is already booked`);
      return;
    }
    
    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(seat => seat !== seatNumber);
      } else {
        return [...prev, seatNumber];
      }
    });
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    navigate('/passenger-details', {
      state: {
        busId: bus._id,
        busNumber: bus.busNumber,
        source: bus.source,
        destination: bus.destination,
        departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime,
        selectedSeats,
        travelDate,
        totalAmount: selectedSeats.length * bus.fareInRupees
      }
    });
  };

  const renderSeatLayout = () => {
    if (!bus) return null;
    
    // Add debugging info
    console.log('Generating seat layout with:', {
      totalSeats: bus.totalSeats,
      seatArrangement: bus.seatArrangement,
      bookedSeats: bookedSeats,
      selectedSeats: selectedSeats
    });
    
    // Default values in case bus data is incomplete
    const totalSeats = bus.totalSeats || 40;
    const seatArrangement = bus.seatArrangement || '2-2';
    
    // Parse the seat arrangement pattern (e.g., "2-2", "2-3", "1-2")
    const pattern = seatArrangement.split('-').map(num => parseInt(num));
    
    // Initialize seats
    const seatsPerRow = pattern.reduce((acc, num) => acc + num, 0) + (pattern.length - 1); // Add aisles
    const numRows = Math.ceil(totalSeats / (pattern.reduce((acc, num) => acc + num, 0)));
    
    console.log('Normalized booked seats:', normalizedBookedSeats);
    
    // Generate the layout
    const layout = [];
    let seatNumber = 1;
    
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      const row = [];
      
      // Left side seats (before aisle)
      for (let i = 0; i < pattern[0]; i++) {
        if (seatNumber <= totalSeats) {
          row.push({
            number: seatNumber,
            isBooked: normalizedBookedSeats.includes(seatNumber.toString()),
            isSelected: selectedSeats.includes(seatNumber)
          });
          seatNumber++;
        } else {
          // Add empty seat placeholder if we've reached total seats
          row.push({ isEmpty: true });
        }
      }
      
      // Add aisle (empty space)
      row.push({ isAisle: true });
      
      // Right side seats (after aisle)
      for (let i = 0; i < pattern[1]; i++) {
        if (seatNumber <= totalSeats) {
          row.push({
            number: seatNumber,
            isBooked: normalizedBookedSeats.includes(seatNumber.toString()),
            isSelected: selectedSeats.includes(seatNumber)
          });
          seatNumber++;
        } else {
          // Add empty seat placeholder if we've reached total seats
          row.push({ isEmpty: true });
        }
      }
      
      layout.push(row);
    }
    
    return layout;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bus details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/book')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Back to Bus Search
          </button>
        </div>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No bus details found</p>
          <button
            onClick={() => navigate('/book')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Back to Bus Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Select Seats</h2>
            {bus && (
              <p className="mt-1 text-sm text-gray-600">
                {bus.source} to {bus.destination} | {bus.busType} Bus | {travelDate}
              </p>
            )}
          </div>

          {/* Seat Layout */}
          {bus && (
            <div className="mb-8">
              <div className="flex justify-center mb-4 space-x-4">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gray-200 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Selected</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gray-400 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Booked</span>
                </div>
              </div>

              {/* Bus cockpit */}
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-8 bg-gray-300 rounded-t-lg flex items-center justify-center text-xs font-medium">
                  Driver
                </div>
              </div>

              {/* Seat grid */}
              <div className="flex justify-center mb-8">
                <div className="block">
                  {renderSeatLayout().map((row, rowIndex) => (
                    <div key={rowIndex} className="flex mb-3 justify-center">
                      {row.map((seat, seatIndex) => (
                        <div 
                          key={`${rowIndex}-${seatIndex}`} 
                          className="mx-1"
                        >
                          {seat.isAisle ? (
                            <div className="w-6 h-10 flex items-center justify-center">
                              <span className="text-xs text-gray-400">|</span>
                            </div>
                          ) : seat.isEmpty ? (
                            <div className="w-10 h-10"></div> // Empty space
                          ) : (
                            <button
                              onClick={() => handleSeatClick(seat.number)}
                              disabled={seat.isBooked}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors
                                ${seat.isBooked 
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : seat.isSelected
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                            >
                              {seat.number}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Selected Seats Summary */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Selected Seats: {selectedSeats.join(', ') || 'None'}</p>
                <p className="text-sm text-gray-600">Total Amount: ₹{selectedSeats.length * (bus?.fareInRupees || 0)}</p>
              </div>
              <button
                onClick={handleContinue}
                disabled={selectedSeats.length === 0}
                className={`px-6 py-2 rounded-md text-white font-medium
                  ${selectedSeats.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                  }`}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectSeats;
