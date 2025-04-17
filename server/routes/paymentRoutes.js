const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Dummy Payment Simulation
router.post('/simulate', auth, async (req, res) => {
  try {
    const { 
      amount, 
      paymentMethod, 
      cardDetails 
    } = req.body;

    // Simulate payment processing
    console.log('Simulating Payment:', {
      userId: req.user._id,
      amount,
      method: paymentMethod
    });

    // Dummy payment validation logic
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }

    // Simulate different payment method scenarios
    switch (paymentMethod) {
      case 'credit_card':
      case 'debit_card':
        // Basic card validation
        if (!cardDetails || !cardDetails.cardNumber || !cardDetails.cvv) {
          return res.status(400).json({
            success: false,
            message: 'Invalid card details'
          });
        }
        break;
      
      case 'upi':
        // Basic UPI validation
        if (!cardDetails || !cardDetails.upiId) {
          return res.status(400).json({
            success: false,
            message: 'Invalid UPI ID'
          });
        }
        break;
      
      case 'net_banking':
        // Basic net banking validation
        if (!cardDetails || !cardDetails.bank) {
          return res.status(400).json({
            success: false,
            message: 'Invalid bank selection'
          });
        }
        break;
      
      case 'cash':
        // Cash payment always succeeds
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported payment method'
        });
    }

    // Simulate payment processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate payment success/failure based on amount
    const isPaymentSuccessful = Math.random() > 0.1; // 90% success rate

    if (isPaymentSuccessful) {
      return res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        transactionId: `DUMMY_TXN_${Date.now()}`,
        paymentMethod,
        amount
      });
    } else {
      return res.status(402).json({
        success: false,
        message: 'Payment failed. Please try again.',
        reason: 'Simulated payment failure'
      });
    }

  } catch (error) {
    console.error('Payment simulation error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing error',
      error: error.message
    });
  }
});

// Payment status check route
router.get('/status/:transactionId', auth, async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Simulate transaction status check
    const statusOptions = [
      'pending',
      'success',
      'failed'
    ];

    const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];

    res.json({
      success: true,
      transactionId,
      status: randomStatus,
      message: `Transaction status: ${randomStatus}`
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking payment status'
    });
  }
});

// Dummy Payment Gateways
const PAYMENT_GATEWAYS = {
  PHONEPE: 'phonepe',
  PAYPAL: 'paypal',
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  UPI: 'upi'
};

// Simulate Payment Gateway
router.post('/gateway', auth, async (req, res) => {
  try {
    const { 
      amount, 
      gateway,
      paymentDetails 
    } = req.body;

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }

    // Validate gateway
    if (!Object.values(PAYMENT_GATEWAYS).includes(gateway)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported payment gateway'
      });
    }

    // Gateway-specific validations
    switch (gateway) {
      case PAYMENT_GATEWAYS.PHONEPE:
        if (!paymentDetails.phoneNumber) {
          return res.status(400).json({
            success: false,
            message: 'PhonePe requires a valid phone number'
          });
        }
        break;
      
      case PAYMENT_GATEWAYS.PAYPAL:
        if (!paymentDetails.email) {
          return res.status(400).json({
            success: false,
            message: 'PayPal requires a valid email'
          });
        }
        break;
      
      case PAYMENT_GATEWAYS.CREDIT_CARD:
      case PAYMENT_GATEWAYS.DEBIT_CARD:
        if (!paymentDetails.cardNumber || !paymentDetails.cvv) {
          return res.status(400).json({
            success: false,
            message: 'Card details are incomplete'
          });
        }
        break;
    }

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate payment success (90% success rate)
    const isPaymentSuccessful = Math.random() > 0.1;

    if (isPaymentSuccessful) {
      return res.status(200).json({
        success: true,
        message: `Payment via ${gateway} processed successfully`,
        transactionId: `${gateway.toUpperCase()}_TXN_${Date.now()}`,
        gateway,
        amount
      });
    } else {
      return res.status(402).json({
        success: false,
        message: `Payment via ${gateway} failed. Please try again.`,
        gateway
      });
    }

  } catch (error) {
    console.error('Payment gateway error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing error',
      error: error.message
    });
  }
});

module.exports = router;
