import React from 'react';
import { Link } from 'react-router-dom';
import { FaBus } from 'react-icons/fa';
import './LandingPage.css';

const BusIcon = () => (
  <div className="hero-bus-icon">
    <FaBus className="hero-bus-svg" />
  </div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-blue-800/90 mix-blend-multiply"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
        ></div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <div className="relative pt-12">
            <BusIcon />
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-center">
              Book Your Bus Tickets Online
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-xl text-gray-200 text-center sm:max-w-3xl">
              Safe, secure, and convenient bus booking platform. Choose from thousands of routes across India.
            </p>
            <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
              <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-1 sm:gap-5">
                <Link
                  to="/book"
                  className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transform transition-transform duration-200 hover:scale-105"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
              Why Choose Us
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              The Best Way to Book Bus Tickets
            </p>
          </div>

          <div className="mt-20">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {[
                {
                  name: 'Easy Booking',
                  description: 'Book your tickets in just a few clicks with our user-friendly interface.',
                  icon: '🎫'
                },
                {
                  name: 'Secure Payments',
                  description: 'Your transactions are protected with bank-grade security.',
                  icon: '🔒'
                },
                {
                  name: '24/7 Support',
                  description: 'Our customer support team is always here to help you.',
                  icon: '💬'
                }
              ].map((feature) => (
                <div key={feature.name} className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white text-2xl">
                      {feature.icon}
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800/90 to-blue-600/90 mix-blend-multiply"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/cta-bg.jpg')" }}
        ></div>
        <div className="relative max-w-7xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to start your journey?</span>
            <span className="block mt-2">Book your tickets today.</span>
          </h2>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50 sm:w-auto transform transition-transform duration-200 hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
