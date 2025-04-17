import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axios';

const DummyPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    // Check if required data is available from previous navigation
    const state = location.state;
    console.log('Payment page state:', state);
    
    if (!state || !state.passengers || !state.selectedSeats) {
      toast.error('Please complete passenger details first');
      navigate('/book');
      return;
    }

    setBookingData(state);
  }, [location.state, navigate]);

  const handleCardDetailsChange = (field, value) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateCardDetails = () => {
    if (paymentMethod === 'card') {
      const { cardNumber, cardholderName, expiryDate, cvv } = cardDetails;
      
      // Very basic validation
      if (!cardNumber || cardNumber.length < 15) {
        toast.error('Please enter a valid card number');
        return false;
      }
      
      if (!cardholderName || cardholderName.length < 3) {
        toast.error('Please enter a valid cardholder name');
        return false;
      }
      
      if (!expiryDate || !expiryDate.match(/^\d{2}\/\d{2}$/)) {
        toast.error('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      
      if (!cvv || !cvv.match(/^\d{3,4}$/)) {
        toast.error('Please enter a valid CVV');
        return false;
      }
    } else if (paymentMethod === 'upi') {
      // Basic UPI validation
      if (!upiId || !upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID');
        return false;
      }
    }
    
    return true;
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCardDetails()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // First, check if seats are still available
      const checkSeatsResponse = await axios.get(`/bookings/bus/${bookingData.busId}/date/${bookingData.travelDate}`);
      
      if (checkSeatsResponse.data.success) {
        const alreadyBookedSeats = checkSeatsResponse.data.bookedSeats || [];
        const unavailableSeats = bookingData.selectedSeats.filter(seat => alreadyBookedSeats.includes(seat));
        
        if (unavailableSeats.length > 0) {
          toast.error(`Seats ${unavailableSeats.join(', ')} are no longer available. Please return to seat selection.`);
          setLoading(false);
          
          // Navigate back to seat selection
          navigate(`/select-seats/${bookingData.busId}`, {
            state: {
              busId: bookingData.busId,
              date: bookingData.travelDate
            }
          });
          return;
        }
      }
      
      // Get the departureTime from bookingData for use as the time field
      const departureTime = bookingData.departureTime || "00:00";
      
      // Prepare booking data
      const bookingPayload = {
        busId: bookingData.busId,
        seats: bookingData.selectedSeats,
        from: bookingData.source,
        to: bookingData.destination,
        date: bookingData.travelDate,
        departureTime: bookingData.departureTime || departureTime,
        arrivalTime: bookingData.arrivalTime,
        fareInRupees: bookingData.totalAmount,
        passengers: bookingData.selectedSeats.map((seat, index) => ({
          seat: seat,
          name: document.getElementById('passengerName')?.value || `Passenger ${index + 1}`,
          age: document.getElementById('passengerAge')?.value || '35',
          gender: document.getElementById('passengerGender')?.value || 'Not specified',
          phone: document.getElementById('phone')?.value || '',
          email: document.getElementById('email')?.value || ''
        }))
      };
      
      console.log('Making API request to:', '/bookings');
      console.log('Booking payload:', bookingPayload);
      
      // Simulate API call delay
      setTimeout(async () => {
        try {
          // Make API call to create booking
          const response = await axios.post('/bookings', bookingPayload);
          console.log('Booking response:', response.data);
          
          if (response.data.success) {
            // Get the booking ID
            const bookingId = response.data.booking._id;
            
            // Update booking status to confirmed
            try {
              await axios.patch(`/bookings/${bookingId}/status`, { status: 'confirmed' });
              console.log('Booking status updated to confirmed');
            } catch (statusError) {
              console.error('Error updating booking status:', statusError);
              // Continue even if status update fails - at least booking was created
            }
            
            toast.success('Payment successful!');
            
            // Navigate to print ticket page with booking details
            navigate('/print-ticket', {
              state: {
                ...bookingData,
                bookingId,
                paymentMethod,
                paymentStatus: 'completed',
                bookingTime: new Date().toISOString(),
                // Add passenger details and departure/arrival times
                departureTime: bookingData.departureTime || response.data.booking.bus?.departureTime || '',
                arrivalTime: bookingData.arrivalTime || response.data.booking.bus?.arrivalTime || '',
                // Use the actual passenger data that was sent to the server
                passengers: bookingPayload.passengers || response.data.booking.passengers
              }
            });
          } else {
            toast.error(response.data.message || 'Payment failed. Please try again.');
          }
        } catch (error) {
          console.error('Error creating booking:', error);
          toast.error('Payment failed. Please try again.');
        } finally {
          setLoading(false);
        }
      }, 1500); // Simulate payment processing delay
      
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Booking Summary */}
          <div className="bg-primary text-white px-6 py-4">
            <h2 className="text-2xl font-bold">Payment</h2>
            <div className="mt-2 text-sm">
              <p className="font-medium text-lg">{bookingData.source} → {bookingData.destination}</p>
              <p>Bus: {bookingData.busNumber} | Date: {new Date(bookingData.travelDate).toLocaleDateString()}</p>
              <p>Seats: {bookingData.selectedSeats.join(', ')}</p>
              <p className="font-medium mt-2">Total Amount: ₹{bookingData.totalAmount}</p>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handlePaymentSubmit} className="px-6 py-4">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Passenger Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    id="passengerName"
                    name="passengerName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Full Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    id="passengerAge"
                    name="passengerAge"
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Age"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    id="passengerGender"
                    name="passengerGender"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Phone Number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Email Address"
                  />
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
            
            <div className="mb-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`px-4 py-3 rounded-lg border flex items-center ${
                    paymentMethod === 'card' ? 'border-primary bg-primary bg-opacity-10' : 'border-gray-200'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Credit/Debit Card</span>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`px-4 py-3 rounded-lg border flex items-center ${
                    paymentMethod === 'upi' ? 'border-primary bg-primary bg-opacity-10' : 'border-gray-200'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>UPI</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">
                    This is a dummy payment page. No real payment will be processed.
                  </p>
                  <p className="text-sm text-gray-500">
                    You can enter any dummy card details for testing.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={(e) => handleCardDetailsChange('cardNumber', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    maxLength="19"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardDetails.cardholderName}
                    onChange={(e) => handleCardDetailsChange('cardholderName', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={(e) => handleCardDetailsChange('expiryDate', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      maxLength="5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CVV</label>
                    <input
                      type="password"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => handleCardDetailsChange('cvv', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      maxLength="4"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {paymentMethod === 'upi' && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">
                    This is a dummy payment page. No real payment will be processed.
                  </p>
                  <p className="text-sm text-gray-500">
                    You can enter any dummy UPI ID for testing.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">UPI ID</label>
                  <input
                    type="text"
                    placeholder="name@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>
              </div>
            )}
            
            <div className="mt-8 flex justify-between items-center">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 bg-primary text-white rounded-md text-sm font-medium ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-dark'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay ₹${bookingData.totalAmount}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DummyPayment;
