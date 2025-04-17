import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Payment Gateways
const PaymentGateways = {
  PHONEPE: 'phonepe',
  PAYPAL: 'paypal',
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  UPI: 'upi'
};

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Force navigation on component mount
  useEffect(() => {
    // Attempt to get booking info from location state
    const bookingInfo = location.state;

    // Validate booking info
    if (!bookingInfo || !bookingInfo.busDetails || !bookingInfo.selectedSeats || !bookingInfo.passengerDetails) {
      toast.error('Incomplete booking information. Redirecting...');
      navigate('/book-ticket');
      return;
    }

    // Generate mock booking details
    const mockBookingId = `BK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const mockTransactionId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Immediately navigate to print ticket
    navigate('/print-ticket', { 
      state: { 
        bookingId: mockBookingId,
        paymentMethod: 'direct',
        bookingDetails: bookingInfo,
        transactionId: mockTransactionId
      },
      replace: true  // Replace current history entry
    });
  }, [location.state, navigate]);

  // Render a loading state
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="text-xl text-gray-700">
        Processing payment... Please wait.
      </div>
    </div>
  );
};

export default PaymentPage;
