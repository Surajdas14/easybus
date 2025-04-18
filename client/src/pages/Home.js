import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { isAuthenticated } from '../utils/authUtils';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    if (isAuthenticated()) {
      // User is logged in, proceed to bus selection
      navigate('/select-bus');
    } else {
      // User is not logged in, redirect to login page
      toast.info('Please log in to book a bus ticket');
      navigate('/login', { state: { from: '/select-bus', message: 'Please log in to continue booking' } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg z-10">
        <div className="text-center">
          <div className="bus-animation-container">
            <div className="animated-bus">
              <div className="bus-body"></div>
              <div className="bus-top"></div>
              <div className="wheel wheel-front"></div>
              <div className="wheel wheel-back"></div>
              <div className="window window-1"></div>
              <div className="window window-2"></div>
              <div className="window window-3"></div>
              <div className="window window-4"></div>
            </div>
            <div className="road"></div>
          </div>
          <h1 className="text-4xl font-bold text-primary">EasyBus</h1>
          <p className="mt-2 text-sm text-gray-600">Your convenient bus booking platform</p>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={handleBookNow}
            className="w-full btn btn-primary py-3 rounded-lg"
          >
            Book a Bus
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            className="w-full btn btn-secondary py-3 rounded-lg"
          >
            Login
          </button>
          
          <button 
            onClick={() => navigate('/register')}
            className="w-full btn btn-outline py-3 rounded-lg"
          >
            Register
          </button>
        </div>

        <div className="text-center text-sm text-gray-500 mt-4">
          <p>&copy; 2025 EasyBus. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
