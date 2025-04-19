import React from 'react';

const AdminFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="container mx-auto py-4 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <i className="fas fa-bus text-blue-400"></i>
            <div>
              <span className="font-medium">GUNGUN</span>
              <span className="mx-2">|</span>
              <span className="text-sm">Admin Portal</span>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm">
            <div className="flex items-center space-x-2">
              <i className="fas fa-clock text-blue-400"></i>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-calendar text-blue-400"></i>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <span> {currentYear} GUNGUN. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
