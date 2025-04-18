import React from 'react';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <AdminHeader />
      <div className="flex-grow">
        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          {children}
        </main>
      </div>
      <AdminFooter />
    </div>
  );
};

export default AdminLayout;
