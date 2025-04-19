import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/admin/AdminLayout';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AgentLogin from './pages/AgentLogin';
import AdminLogin from './pages/AdminLogin';
import BusManagement from './pages/admin/BusManagement';
import AgentsManagement from './pages/admin/AgentsManagement';
import BookingsManagement from './pages/admin/BookingsManagement';
import UsersManagement from './pages/admin/UsersManagement';
import Settings from './pages/admin/Settings';
import AdminDashboard from './pages/admin/Dashboard';
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import BookingDetails from './pages/BookingDetails';
import BookTicket from './pages/BookTicket';
import SelectSeats from './pages/SelectSeats';
import PassengerDetails from './pages/PassengerDetails';
import DummyPayment from './pages/DummyPayment';
import PrintTicket from './pages/PrintTicket';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import QuickLinks from './pages/QuickLinks';
import Services from './pages/Services';

// Import Agent Pages
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentPrintTicket from './pages/agent/AgentPrintTicket';
import AgentBooking from './pages/agent/AgentBooking';

import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  <Route path="/buses" element={<BusManagement />} />
                  <Route path="/agents" element={<AgentsManagement />} />
                  <Route path="/bookings" element={<BookingsManagement />} />
                  <Route path="/users" element={<UsersManagement />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />

        {/* Agent Routes - Added new agent routes */}
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
        <Route path="/agent/print-ticket" element={<AgentPrintTicket />} />
        <Route path="/agent/book" element={<AgentBooking />} />
        <Route path="/agent/select-seats" element={<SelectSeats />} />
        <Route path="/agent/passenger-details" element={<PassengerDetails />} />
        <Route path="/agent/payment" element={<DummyPayment />} />

        {/* Public Routes */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/agent-login" element={<AgentLogin />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/my-bookings" element={<MyBookings />} />
                  <Route path="/booking/:id" element={<BookingDetails />} />
                  <Route path="/book" element={<BookTicket />} />
                  <Route path="/select-seats/:busId" element={<SelectSeats />} />
                  <Route path="/passenger-details" element={<PassengerDetails />} />
                  <Route path="/payment" element={<DummyPayment />} />
                  <Route path="/print-ticket" element={<PrintTicket />} />
                  <Route path="/quick-links" element={<QuickLinks />} />
                  <Route path="/services" element={<Services />} />
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
    </Router>
  );
}

export default App;
