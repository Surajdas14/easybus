import React from 'react';

const quickLinks = [
  { label: 'Book a Bus', path: '/book' },
  { label: 'My Bookings', path: '/my-bookings' },
  { label: 'Search Buses', path: '/search' },
  { label: 'Login', path: '/login' },
  { label: 'Register', path: '/register' },
  { label: 'Agent Portal', path: '/agent-login' },
];

const QuickLinks = () => (
  <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-4">
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">Quick Links</h1>
      <ul className="space-y-4">
        {quickLinks.map(link => (
          <li key={link.path}>
            <a
              href={link.path}
              className="block w-full text-lg font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg px-6 py-3 transition-colors duration-200 shadow-sm text-center"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default QuickLinks;
