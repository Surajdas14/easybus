import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <i className="fas fa-bus text-3xl text-primary"></i>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">EasyBus</span>
            </div>
            <p className="text-gray-400">
              Making bus travel easy, comfortable, and accessible for everyone.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                className="text-gray-400 hover:text-primary transform hover:scale-110 transition-all duration-300">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
                className="text-gray-400 hover:text-primary transform hover:scale-110 transition-all duration-300">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                className="text-gray-400 hover:text-primary transform hover:scale-110 transition-all duration-300">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" 
                className="text-gray-400 hover:text-primary transform hover:scale-110 transition-all duration-300">
                <i className="fab fa-linkedin text-xl"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center space-x-2 group">
                  <i className="fas fa-chevron-right text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center space-x-2 group">
                  <i className="fas fa-chevron-right text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
                  <span>Contact Us</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center space-x-2 group">
                  <i className="fas fa-chevron-right text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
                  <span>Terms & Conditions</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center space-x-2 group">
                  <i className="fas fa-chevron-right text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
                  <span>Privacy Policy</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/bus-tickets" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center space-x-2 group">
                  <i className="fas fa-chevron-right text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
                  <span>Bus Tickets</span>
                </Link>
              </li>
              <li>
                <Link to="/bus-hire" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center space-x-2 group">
                  <i className="fas fa-chevron-right text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
                  <span>Bus Hire</span>
                </Link>
              </li>
              <li>
                <Link to="/track-bus" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center space-x-2 group">
                  <i className="fas fa-chevron-right text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
                  <span>Track Bus</span>
                </Link>
              </li>
              <li>
                <Link to="/offers" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center space-x-2 group">
                  <i className="fas fa-chevron-right text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
                  <span>Offers & Discounts</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3 text-gray-400 group">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                  <i className="fas fa-phone text-sm"></i>
                </div>
                <span>+91 1234567890</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 group">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                  <i className="fas fa-envelope text-sm"></i>
                </div>
                <span>support@easybus.com</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 group">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                  <i className="fas fa-map-marker-alt text-sm"></i>
                </div>
                <span>123 Business Street, City, State, 123456</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              {currentYear} EasyBus. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <i className="fab fa-cc-visa text-3xl text-gray-400 hover:text-primary transition-all duration-300 transform hover:scale-110"></i>
              <i className="fab fa-cc-mastercard text-3xl text-gray-400 hover:text-primary transition-all duration-300 transform hover:scale-110"></i>
              <i className="fab fa-cc-paypal text-3xl text-gray-400 hover:text-primary transition-all duration-300 transform hover:scale-110"></i>
              <i className="fas fa-qrcode text-3xl text-gray-400 hover:text-primary transition-all duration-300 transform hover:scale-110"></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
