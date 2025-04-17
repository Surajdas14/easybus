import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EmailVerification = ({ userId }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  // Handle OTP input change
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Move to next input if current field is filled
    if (element.value && index < 5) {
      const nextInput = element.parentElement.nextElementSibling.querySelector('input');
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Handle keydown event
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = e.target.parentElement.previousElementSibling.querySelector('input');
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // Start countdown timer
  const startCountdown = () => {
    setCountdown(60);
    setResendDisabled(true);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle OTP verification
  const handleVerify = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post('/api/auth/verify-email', {
        userId,
        otp: otp.join('')
      });

      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP resend
  const handleResend = async () => {
    try {
      setError('');
      await axios.post('/api/auth/resend-otp', { userId });
      startCountdown();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a verification code to your email address
          </p>
        </div>
        
        {/* OTP Input */}
        <div className="mt-8">
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <div key={index} className="w-12">
                <input
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-full h-12 text-center text-2xl font-semibold border-2 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <p className="mt-2 text-center text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Verify Button */}
          <div className="mt-6">
            <button
              onClick={handleVerify}
              disabled={loading || otp.some(digit => !digit)}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify Email'
              )}
            </button>
          </div>

          {/* Resend OTP */}
          <div className="mt-4 text-center">
            <button
              onClick={handleResend}
              disabled={resendDisabled}
              className="text-sm text-primary hover:text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendDisabled ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
