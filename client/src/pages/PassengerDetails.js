import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowRight, FaUserAlt, FaBirthdayCake, FaVenusMars, FaEnvelope, FaPhone, FaArrowLeft, FaTicketAlt, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaBus, FaRupeeSign } from 'react-icons/fa';

const PassengerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [busDetails, setBusDetails] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [travelDate, setTravelDate] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Check if required data is available from previous navigation
    const state = location.state;
    console.log('Location state:', state);
    
    if (!state || !state.selectedSeats || !state.travelDate) {
      toast.error('Please select seats first');
      navigate('/book');
      return;
    }

    // Initialize passengers with selected seats
    const initialPassengers = state.selectedSeats.map((seat) => ({
      name: '',
      age: '',
      gender: '',
      seat: seat,
      email: '',
      phone: ''
    }));

    // Create bus details object from state
    const busInfo = {
      _id: state.busId,
      busNumber: state.busNumber,
      source: state.source,
      destination: state.destination,
      departureTime: state.departureTime,
      arrivalTime: state.arrivalTime
    };

    setBusDetails(busInfo);
    setSelectedSeats(state.selectedSeats);
    setPassengers(initialPassengers);
    setTravelDate(state.travelDate);
    setTotalAmount(state.totalAmount || 0);
  }, [location.state, navigate]);

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
    
    // Clear error for this field if it exists
    if (errors[`passenger-${index}-${field}`]) {
      const newErrors = {...errors};
      delete newErrors[`passenger-${index}-${field}`];
      setErrors(newErrors);
    }
  };

  const validatePassengers = () => {
    const newErrors = {};
    let isValid = true;
    
    passengers.forEach((passenger, index) => {
      // Validate name
      if (!passenger.name || passenger.name.trim().length < 3) {
        newErrors[`passenger-${index}-name`] = 'Name must be at least 3 characters';
        isValid = false;
      }
      
      // Validate age
      const age = parseInt(passenger.age);
      if (!passenger.age || isNaN(age) || age < 1 || age > 120) {
        newErrors[`passenger-${index}-age`] = 'Enter a valid age (1-120)';
        isValid = false;
      }
      
      // Validate gender
      if (!passenger.gender) {
        newErrors[`passenger-${index}-gender`] = 'Select a gender';
        isValid = false;
      }
      
      // Email validation if provided
      if (passenger.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email)) {
        newErrors[`passenger-${index}-email`] = 'Enter a valid email address';
        isValid = false;
      }
      
      // Phone validation if provided
      if (passenger.phone && !/^\d{10}$/.test(passenger.phone)) {
        newErrors[`passenger-${index}-phone`] = 'Enter a valid 10-digit phone number';
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    
    if (!isValid) {
      toast.error('Please correct the errors in the form');
    }
    
    return isValid;
  };

  const handleContinue = () => {
    if (!validatePassengers()) {
      return;
    }

    // Navigate to payment page
    navigate('/payment', {
      state: {
        busId: busDetails._id,
        busNumber: busDetails.busNumber,
        source: busDetails.source,
        destination: busDetails.destination,
        departureTime: busDetails.departureTime,
        arrivalTime: busDetails.arrivalTime,
        selectedSeats,
        passengers,
        totalAmount,
        travelDate
      }
    });
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (!busDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading passenger details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="rounded-full h-10 w-10 flex items-center justify-center bg-blue-600 text-white">
                1
              </div>
              <div className="ml-2 text-blue-600 font-medium">Select Seats</div>
            </div>
            <div className="h-1 w-16 bg-blue-600 mx-3"></div>
            <div className="flex items-center">
              <div className="rounded-full h-10 w-10 flex items-center justify-center bg-blue-600 text-white font-bold border-4 border-blue-200">
                2
              </div>
              <div className="ml-2 text-blue-600 font-semibold">Passenger Details</div>
            </div>
            <div className="h-1 w-16 bg-gray-300 mx-3"></div>
            <div className="flex items-center">
              <div className="rounded-full h-10 w-10 flex items-center justify-center bg-gray-300 text-gray-600">
                3
              </div>
              <div className="ml-2 text-gray-500">Payment</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
          {/* Journey Summary */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-6">
            <h2 className="text-2xl font-bold flex items-center">
              <FaTicketAlt className="mr-3" />
              Journey Details
            </h2>
            
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center">
                <FaBus className="text-blue-200 text-xl mr-3" />
                <div>
                  <p className="text-xs text-blue-200">Bus Number</p>
                  <p className="font-semibold">{busDetails.busNumber}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaCalendarAlt className="text-blue-200 text-xl mr-3" />
                <div>
                  <p className="text-xs text-blue-200">Travel Date</p>
                  <p className="font-semibold">{formatDate(travelDate)}</p>
                </div>
              </div>
              
              <div className="flex items-center mt-3">
                <div className="mr-3 flex flex-col items-center">
                  <FaMapMarkerAlt className="text-blue-200 text-xl" />
                  <div className="h-6 w-0.5 bg-blue-200 my-1"></div>
                  <FaMapMarkerAlt className="text-blue-200 text-xl" />
                </div>
                <div>
                  <div>
                    <p className="text-xs text-blue-200">From</p>
                    <p className="font-semibold">{busDetails.source}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-blue-200">To</p>
                    <p className="font-semibold">{busDetails.destination}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center mt-3">
                <FaClock className="text-blue-200 text-xl mr-3" />
                <div>
                  <div className="flex items-center">
                    <div>
                      <p className="text-xs text-blue-200">Departure</p>
                      <p className="font-semibold">{busDetails.departureTime}</p>
                    </div>
                    <FaArrowRight className="mx-3 text-sm text-blue-200" />
                    <div>
                      <p className="text-xs text-blue-200">Arrival</p>
                      <p className="font-semibold">{busDetails.arrivalTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between p-3 bg-blue-900 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-blue-700 rounded-lg">
                  <FaTicketAlt className="text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-blue-200">Selected Seats</p>
                  <p className="font-bold">{selectedSeats.join(', ')}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="p-2 bg-blue-700 rounded-lg">
                  <FaRupeeSign className="text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-blue-200">Total Amount</p>
                  <p className="font-bold">₹{totalAmount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Forms */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <FaUserAlt className="mr-3 text-blue-600" />
              Enter Passenger Details
            </h3>

            {passengers.map((passenger, index) => (
              <div 
                key={passenger.seat} 
                className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300"
              >
                <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-200 flex items-center">
                  <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center mr-3">
                    {index + 1}
                  </div>
                  Passenger {index + 1} - Seat {passenger.seat}
                </h4>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaUserAlt className="mr-2 text-blue-500" />
                      Full Name <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={passenger.name}
                      onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                      className={`block w-full px-4 py-3 rounded-lg border ${errors[`passenger-${index}-name`] ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors`}
                      placeholder="e.g. John Smith"
                    />
                    {errors[`passenger-${index}-name`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`passenger-${index}-name`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaBirthdayCake className="mr-2 text-blue-500" />
                      Age <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="number"
                      value={passenger.age}
                      onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                      className={`block w-full px-4 py-3 rounded-lg border ${errors[`passenger-${index}-age`] ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors`}
                      placeholder="e.g. 32"
                      min="1"
                      max="120"
                    />
                    {errors[`passenger-${index}-age`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`passenger-${index}-age`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaVenusMars className="mr-2 text-blue-500" />
                      Gender <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      value={passenger.gender}
                      onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                      className={`block w-full px-4 py-3 rounded-lg border ${errors[`passenger-${index}-gender`] ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors`}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors[`passenger-${index}-gender`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`passenger-${index}-gender`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaEnvelope className="mr-2 text-blue-500" />
                      Email <span className="text-gray-400 text-xs ml-1">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={passenger.email}
                      onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                      className={`block w-full px-4 py-3 rounded-lg border ${errors[`passenger-${index}-email`] ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors`}
                      placeholder="e.g. john@example.com"
                    />
                    {errors[`passenger-${index}-email`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`passenger-${index}-email`]}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaPhone className="mr-2 text-blue-500" />
                      Phone <span className="text-gray-400 text-xs ml-1">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={passenger.phone}
                      onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                      className={`block w-full px-4 py-3 rounded-lg border ${errors[`passenger-${index}-phone`] ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors`}
                      placeholder="e.g. 9876543210"
                    />
                    {errors[`passenger-${index}-phone`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`passenger-${index}-phone`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 rounded-lg flex items-center text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                Back to Seat Selection
              </button>
              <button
                onClick={handleContinue}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg flex items-center font-medium shadow-md hover:shadow-lg transition-all"
              >
                Continue to Payment
                <FaArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerDetails;
