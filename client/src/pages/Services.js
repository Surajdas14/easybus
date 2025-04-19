import React from 'react';
import { FaBus, FaCreditCard, FaHeadset, FaShieldAlt, FaMobileAlt } from 'react-icons/fa';

const services = [
  {
    icon: <FaBus className="text-blue-600 text-3xl mb-2" />,
    title: 'Bus Booking',
    description: 'Easily book bus tickets for thousands of routes across India.'
  },
  {
    icon: <FaCreditCard className="text-blue-600 text-3xl mb-2" />,
    title: 'Secure Payments',
    description: 'Multiple payment options with bank-grade security.'
  },
  {
    icon: <FaHeadset className="text-blue-600 text-3xl mb-2" />,
    title: '24/7 Customer Support',
    description: 'Our support team is available round the clock to assist you.'
  },
  {
    icon: <FaShieldAlt className="text-blue-600 text-3xl mb-2" />,
    title: 'Safe Travel',
    description: 'Verified operators and safe travel experience for all.'
  },
  {
    icon: <FaMobileAlt className="text-blue-600 text-3xl mb-2" />,
    title: 'Mobile Friendly',
    description: 'Book and manage tickets easily from any device.'
  },
];

const Services = () => (
  <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-4">
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">Our Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((service, idx) => (
          <div key={idx} className="flex flex-col items-center text-center p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200 bg-blue-50">
            {service.icon}
            <h2 className="text-xl font-semibold mt-2 mb-1 text-blue-800">{service.title}</h2>
            <p className="text-gray-600">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Services;
