import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/axios';

const BusManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formSubmitPending, setFormSubmitPending] = useState(false);
  const [formData, setFormData] = useState({
    busNumber: '',
    source: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    bookingOpenTime: '00:00',
    bookingCloseTime: '23:59',
    advanceBookingDays: 30,
    totalSeats: 41,
    seatArrangement: '2-2',
    busType: 'AC',
    fareInRupees: '',
    firstRowSeats: 2,
    lastRowSeats: 3,
    isActive: true,
    isOvernight: false
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/buses');
      console.log('Fetched buses:', response.data);
      setBuses(response.data || []);
    } catch (error) {
      console.error('Error fetching buses:', error);
      if (error.response?.status === 401) {
        toast.error('Please login again');
        window.location.href = '/admin/login';
      } else {
        toast.error('Failed to fetch buses');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate booking times
    const { bookingOpenTime, bookingCloseTime } = formData;
    
    // Check if this might be an overnight window (closing time before opening time)
    if (bookingCloseTime < bookingOpenTime) {
      // Show confirmation modal instead of using browser confirm
      setFormSubmitPending(true);
      setShowConfirmModal(true);
      return;
    }
    
    // Otherwise proceed with normal submission (not overnight)
    await submitForm(false);
  };
  
  // New function to handle the actual form submission after confirmation
  const submitForm = async (isOvernight) => {
    try {
      const payload = {
        ...formData,
        fareInRupees: parseInt(formData.fareInRupees),
        totalSeats: parseInt(formData.totalSeats),
        advanceBookingDays: parseInt(formData.advanceBookingDays),
        firstRowSeats: parseInt(formData.firstRowSeats),
        lastRowSeats: parseInt(formData.lastRowSeats),
        isOvernight // Add this flag to help with time window validation
      };

      if (isEditing && formData._id) {
        await api.patch(`/buses/${formData._id}`, payload);
        toast.success('Bus updated successfully!');
      } else {
        await api.post('/buses', payload);
        toast.success('Bus added successfully!');
      }

      setShowForm(false);
      await fetchBuses();
      resetForm();
    } catch (error) {
      console.error('Error submitting bus:', error);
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} bus`);
    }
    setFormSubmitPending(false);
  };

  const resetForm = () => {
    setFormData({
      busNumber: '',
      source: '',
      destination: '',
      departureTime: '',
      arrivalTime: '',
      bookingOpenTime: '00:00',
      bookingCloseTime: '23:59',
      advanceBookingDays: 30,
      totalSeats: 41,
      seatArrangement: '2-2',
      busType: 'AC',
      fareInRupees: '',
      firstRowSeats: 2,
      lastRowSeats: 3,
      isActive: true
    });
    setIsEditing(false);
  };

  const handleEdit = (bus) => {
    setFormData({
      ...bus,
      fareInRupees: bus.fareInRupees.toString()
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (busId) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await api.delete(`/buses/${busId}`);
        toast.success('Bus deleted successfully');
        await fetchBuses();
      } catch (error) {
        console.error('Error deleting bus:', error);
        toast.error('Failed to delete bus');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bus Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200"
        >
          Add New Bus
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {isEditing ? 'Edit Bus' : 'Add New Bus'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bus Number
                  </label>
                  <input
                    type="text"
                    value={formData.busNumber}
                    onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bus Type
                  </label>
                  <select
                    value={formData.busType}
                    onChange={(e) => setFormData({ ...formData, busType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="AC">AC</option>
                    <option value="Non-AC">Non-AC</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Super Deluxe">Super Deluxe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source
                  </label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Time
                  </label>
                  <input
                    type="time"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrival Time
                  </label>
                  <input
                    type="time"
                    value={formData.arrivalTime}
                    onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fare (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.fareInRupees}
                    onChange={(e) => setFormData({ ...formData, fareInRupees: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-700 mb-4">Booking Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Booking Open Time
                    </label>
                    <input
                      type="time"
                      value={formData.bookingOpenTime}
                      onChange={(e) => setFormData({ ...formData, bookingOpenTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Booking Close Time
                    </label>
                    <input
                      type="time"
                      value={formData.bookingCloseTime}
                      onChange={(e) => setFormData({ ...formData, bookingCloseTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Advance Booking Days
                    </label>
                    <input
                      type="number"
                      value={formData.advanceBookingDays}
                      onChange={(e) => setFormData({ ...formData, advanceBookingDays: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      max="90"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-700 mb-4">Seat Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Seats
                    </label>
                    <input
                      type="number"
                      value={formData.totalSeats}
                      onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="20"
                      max="60"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seat Arrangement
                    </label>
                    <select
                      value={formData.seatArrangement}
                      onChange={(e) => setFormData({ ...formData, seatArrangement: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="2-2">2-2 (Standard)</option>
                      <option value="2-1">2-1 (Luxury)</option>
                      <option value="1-1">1-1 (Super Luxury)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Row Seats
                    </label>
                    <input
                      type="number"
                      value={formData.firstRowSeats}
                      onChange={(e) => setFormData({ ...formData, firstRowSeats: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="1"
                      max="4"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Row Seats
                    </label>
                    <input
                      type="number"
                      value={formData.lastRowSeats}
                      onChange={(e) => setFormData({ ...formData, lastRowSeats: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="2"
                      max="5"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                >
                  {isEditing ? 'Update Bus' : 'Add Bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overnight Booking Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Overnight Booking Window</h3>
            <p className="mb-6">
              The booking window from <span className="font-medium">{formData.bookingOpenTime}</span> to{" "}
              <span className="font-medium">{formData.bookingCloseTime}</span> has the closing time before 
              the opening time. Is this an overnight booking window that extends past midnight?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  toast.error(
                    `Invalid booking time window: ${formData.bookingOpenTime} - ${formData.bookingCloseTime}. ` +
                    `Please fix the times so the closing time is after the opening time.`
                  );
                  setFormSubmitPending(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  submitForm(true);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Yes, It's Overnight
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bus Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {buses.map((bus) => (
                  <tr key={bus._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{bus.busNumber}</div>
                      <div className="text-sm text-gray-500">{bus.busType}</div>
                      <div className="text-sm text-gray-500">₹{bus.fareInRupees}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{bus.source}</div>
                      <div className="text-sm text-gray-500">to</div>
                      <div className="text-sm text-gray-900">{bus.destination}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">Dep: {bus.departureTime}</div>
                      <div className="text-sm text-gray-900">Arr: {bus.arrivalTime}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">Total: {bus.totalSeats}</div>
                      <div className="text-sm text-gray-500">{bus.seatArrangement}</div>
                      <div className="text-sm text-gray-500">
                        First: {bus.firstRowSeats}, Last: {bus.lastRowSeats}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {bus.bookingOpenTime} - {bus.bookingCloseTime}
                      </div>
                      <div className="text-sm text-gray-500">{bus.advanceBookingDays} days advance</div>
                    </td>
                    <td className="px-6 py-4 space-x-3">
                      <button
                        onClick={() => handleEdit(bus)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(bus._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusManagement;
