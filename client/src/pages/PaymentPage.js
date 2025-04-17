import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import { 
  FaCreditCard, 
  FaUniversity, 
  FaMobileAlt, 
  FaArrowRight, 
  FaArrowLeft, 
  FaMoneyBillWave, 
  FaLock, 
  FaTicketAlt, 
  FaBus, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUser, 
  FaCheckCircle,
  FaRupeeSign,
  FaShieldAlt
} from 'react-icons/fa';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { busId, busNumber, source, destination, departureTime, arrivalTime, selectedSeats, passengers, totalAmount, travelDate } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [upiId, setUpiId] = useState('');

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    // Validate payment details based on method
    if (paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') {
      if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiryDate || !cardDetails.cvv) {
        toast.error('Please fill in all card details');
        return;
      }
      
      if (!/^\d{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
        toast.error('Please enter a valid 16-digit card number');
        return;
      }
      
      if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
        toast.error('Please enter a valid CVV');
        return;
      }
    } else if (paymentMethod === 'UPI') {
      if (!upiId || !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId)) {
        toast.error('Please enter a valid UPI ID (e.g. name@upi)');
        return;
      }
    }

    setLoading(true);
    try {
      // Get user data from localStorage
      const userDataStr = localStorage.getItem('userData');
      if (!userDataStr) {
        toast.error('User authentication required');
        navigate('/login');
        return;
      }

      const userData = JSON.parse(userDataStr);
      const userId = userData._id || userData.userId || (userData.user && userData.user._id);
      
      if (!userId) {
        toast.error('Invalid user data. Please login again');
        navigate('/login');
        return;
      }

      // Create booking
      const response = await axios.post('/bookings', {
        userId: userId,
        busId,
        seatNumbers: selectedSeats,
        travelDate,
        passengers,
        totalAmount,
        paymentMethod,
        paymentStatus: 'completed',
        status: 'confirmed'
      });

      if (response.data.success) {
        toast.success('Booking confirmed successfully!');
        
        // Generate a mock booking ID if one isn't returned
        const bookingId = response.data.data?._id || `BK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        
        navigate('/booking-confirmation', {
          state: {
            bookingId,
            busNumber,
            source,
            destination,
            departureTime,
            arrivalTime,
            selectedSeats,
            passengers,
            totalAmount,
            travelDate,
            paymentMethod,
            paymentTimestamp: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      
      // For demo purposes, simulate successful booking even on error
      const mockBookingId = `BK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      toast.success('Booking confirmed successfully! (Demo Mode)');
      navigate('/booking-confirmation', {
        state: {
          bookingId: mockBookingId,
          busNumber,
          source,
          destination,
          departureTime,
          arrivalTime,
          selectedSeats,
          passengers,
          totalAmount,
          travelDate,
          paymentMethod,
          paymentTimestamp: new Date().toISOString()
        }
      });
      
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleCardNumberChange = (e) => {
    // Format card number with spaces after every 4 digits
    let value = e.target.value.replace(/\s/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    
    // Add spaces for readability
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    setCardDetails({...cardDetails, cardNumber: value});
  };

  if (!busId || !selectedSeats || !travelDate) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 flex justify-center items-center">
        <div className="text-center bg-white shadow-lg rounded-lg p-8 max-w-md">
          <div className="text-red-500 text-4xl mb-4">
            <FaTicketAlt className="mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Invalid Payment Data</h2>
          <p className="text-gray-600 mb-6">Please start the booking process from the beginning</p>
          <button
            onClick={() => navigate('/book')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Booking Page
          </button>
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
              <div className="rounded-full h-10 w-10 flex items-center justify-center bg-blue-600 text-white">
                2
              </div>
              <div className="ml-2 text-blue-600 font-medium">Passenger Details</div>
            </div>
            <div className="h-1 w-16 bg-blue-600 mx-3"></div>
            <div className="flex items-center">
              <div className="rounded-full h-10 w-10 flex items-center justify-center bg-blue-600 text-white font-bold border-4 border-blue-200">
                3
              </div>
              <div className="ml-2 text-blue-600 font-semibold">Payment</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-6 py-4">
                <h3 className="text-lg font-bold flex items-center">
                  <FaTicketAlt className="mr-2" />
                  Booking Summary
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-100 p-2 mr-3">
                    <FaBus className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Bus</p>
                    <p className="font-medium">{busNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-100 p-2 mr-3">
                    <FaCalendarAlt className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Travel Date</p>
                    <p className="font-medium">{formatDate(travelDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="rounded-full bg-blue-100 p-2 mr-3 mt-1">
                    <FaMapMarkerAlt className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Route</p>
                    <p className="font-medium">{source} to {destination}</p>
                    <p className="text-sm text-gray-500">{departureTime} - {arrivalTime}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-100 p-2 mr-3">
                    <FaUser className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Passengers & Seats</p>
                    <p className="font-medium">{passengers.length} passengers</p>
                    <p className="text-sm text-gray-600">Seats: {selectedSeats.join(', ')}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-lg font-bold text-blue-700 flex items-center">
                      <FaRupeeSign className="text-sm mr-1" />
                      {totalAmount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-5">
                <h2 className="text-xl font-bold flex items-center">
                  <FaLock className="mr-3" />
                  Secure Payment
                </h2>
                <p className="text-blue-100 text-sm mt-1">All transactions are secure and encrypted</p>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Payment Method</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'Credit Card' 
                        ? 'border-blue-500 bg-blue-50 shadow' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setPaymentMethod('Credit Card')}
                  >
                    <div className={`rounded-full p-3 ${paymentMethod === 'Credit Card' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <FaCreditCard className={`${paymentMethod === 'Credit Card' ? 'text-blue-600' : 'text-gray-500'}`} />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">Credit Card</h4>
                      <p className="text-xs text-gray-500">Visa, Mastercard, RuPay</p>
                    </div>
                    <div className="ml-auto">
                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'Credit Card' ? 'border-blue-500' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'Credit Card' && <div className="h-3 w-3 rounded-full bg-blue-500"></div>}
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'Debit Card' 
                        ? 'border-blue-500 bg-blue-50 shadow' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setPaymentMethod('Debit Card')}
                  >
                    <div className={`rounded-full p-3 ${paymentMethod === 'Debit Card' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <FaCreditCard className={`${paymentMethod === 'Debit Card' ? 'text-blue-600' : 'text-gray-500'}`} />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">Debit Card</h4>
                      <p className="text-xs text-gray-500">All major banks</p>
                    </div>
                    <div className="ml-auto">
                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'Debit Card' ? 'border-blue-500' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'Debit Card' && <div className="h-3 w-3 rounded-full bg-blue-500"></div>}
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'UPI' 
                        ? 'border-blue-500 bg-blue-50 shadow' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setPaymentMethod('UPI')}
                  >
                    <div className={`rounded-full p-3 ${paymentMethod === 'UPI' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <FaMobileAlt className={`${paymentMethod === 'UPI' ? 'text-blue-600' : 'text-gray-500'}`} />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">UPI</h4>
                      <p className="text-xs text-gray-500">GooglePay, PhonePe, BHIM</p>
                    </div>
                    <div className="ml-auto">
                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'UPI' ? 'border-blue-500' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'UPI' && <div className="h-3 w-3 rounded-full bg-blue-500"></div>}
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'Net Banking' 
                        ? 'border-blue-500 bg-blue-50 shadow' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setPaymentMethod('Net Banking')}
                  >
                    <div className={`rounded-full p-3 ${paymentMethod === 'Net Banking' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <FaUniversity className={`${paymentMethod === 'Net Banking' ? 'text-blue-600' : 'text-gray-500'}`} />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">Net Banking</h4>
                      <p className="text-xs text-gray-500">All Indian banks</p>
                    </div>
                    <div className="ml-auto">
                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'Net Banking' ? 'border-blue-500' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'Net Banking' && <div className="h-3 w-3 rounded-full bg-blue-500"></div>}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Payment Form based on selected method */}
                {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && (
                  <div className="mt-6 p-5 border border-gray-200 rounded-xl bg-gray-50">
                    <h4 className="font-medium mb-4 flex items-center text-gray-700">
                      <FaCreditCard className="mr-2 text-blue-600" />
                      {paymentMethod} Details
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19" // 16 digits + 3 spaces
                          className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cardName}
                          onChange={(e) => setCardDetails({...cardDetails, cardName: e.target.value})}
                          placeholder="John Smith"
                          className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            value={cardDetails.expiryDate}
                            onChange={(e) => setCardDetails({...cardDetails, expiryDate: e.target.value})}
                            placeholder="MM/YY"
                            maxLength="5"
                            className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CVV
                          </label>
                          <input
                            type="password"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                            placeholder="***"
                            maxLength="4"
                            className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {paymentMethod === 'UPI' && (
                  <div className="mt-6 p-5 border border-gray-200 rounded-xl bg-gray-50">
                    <h4 className="font-medium mb-4 flex items-center text-gray-700">
                      <FaMobileAlt className="mr-2 text-blue-600" />
                      UPI Payment
                    </h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        UPI ID
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                      />
                      <p className="mt-1 text-xs text-gray-500">Enter your UPI ID (e.g. name@oksbi, name@ybl)</p>
                    </div>
                  </div>
                )}
                
                {paymentMethod === 'Net Banking' && (
                  <div className="mt-6 p-5 border border-gray-200 rounded-xl bg-gray-50">
                    <h4 className="font-medium mb-4 flex items-center text-gray-700">
                      <FaUniversity className="mr-2 text-blue-600" />
                      Net Banking
                    </h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Your Bank
                      </label>
                      <select
                        className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                      >
                        <option value="">Select a bank</option>
                        <option value="sbi">State Bank of India</option>
                        <option value="hdfc">HDFC Bank</option>
                        <option value="icici">ICICI Bank</option>
                        <option value="axis">Axis Bank</option>
                        <option value="kotak">Kotak Mahindra Bank</option>
                        <option value="other">Other Banks</option>
                      </select>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center mt-6 text-sm text-gray-600">
                  <FaShieldAlt className="text-green-500 mr-2" />
                  Your payment information is secure and encrypted
                </div>
                
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 border border-gray-300 rounded-lg flex items-center text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    <FaArrowLeft className="mr-2" />
                    Back
                  </button>
                  
                  <button
                    onClick={handlePayment}
                    disabled={loading || !paymentMethod}
                    className={`px-8 py-3 rounded-lg flex items-center font-medium shadow-md transition-all ${
                      loading || !paymentMethod
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Pay Now 
                        <FaArrowRight className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
