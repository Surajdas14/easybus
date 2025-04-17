import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Buses = () => {
  const [buses, setBuses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
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
    firstRowSeats: 2,
    lastRowSeats: 5,
    fareInRupees: 0,
    isActive: true
  });

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/admin/buses', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setBuses(response.data);
      } catch (error) {
        console.error('Error fetching buses:', error);
      }
    };

    fetchBuses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBus) {
        // Update existing bus
        const response = await axios.patch(
          `http://localhost:5001/api/admin/buses/${editingBus._id}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setBuses(buses.map(bus => bus._id === editingBus._id ? response.data : bus));
        setEditingBus(null);
      } else {
        // Add new bus
        const response = await axios.post('http://localhost:5001/api/admin/buses', formData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setBuses([response.data, ...buses]);
      }
      setShowAddForm(false);
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
        firstRowSeats: 2,
        lastRowSeats: 5,
        fareInRupees: 0,
        isActive: true
      });
    } catch (error) {
      console.error('Error saving bus:', error);
      alert(error.response?.data?.message || 'Failed to save bus');
    }
  };

  const handleEdit = (bus) => {
    setEditingBus(bus);
    setFormData({
      busNumber: bus.busNumber,
      source: bus.source,
      destination: bus.destination,
      departureTime: bus.departureTime,
      arrivalTime: bus.arrivalTime,
      bookingOpenTime: bus.bookingOpenTime,
      bookingCloseTime: bus.bookingCloseTime,
      advanceBookingDays: bus.advanceBookingDays,
      totalSeats: bus.totalSeats,
      seatArrangement: bus.seatArrangement,
      busType: bus.busType,
      firstRowSeats: bus.firstRowSeats,
      lastRowSeats: bus.lastRowSeats,
      fareInRupees: bus.fareInRupees,
      isActive: bus.isActive
    });
    setShowAddForm(true);
  };

  const handleDelete = async (busId) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await axios.delete(`http://localhost:5001/api/admin/buses/${busId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setBuses(buses.filter(bus => bus._id !== busId));
      } catch (error) {
        console.error('Error deleting bus:', error);
        alert(error.response?.data?.message || 'Failed to delete bus');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingBus(null);
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
      firstRowSeats: 2,
      lastRowSeats: 5,
      fareInRupees: 0,
      isActive: true
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Bus Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Add New Bus
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">
              {editingBus ? 'Edit Bus' : 'Add New Bus'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bus Number</label>
                  <input
                    type="text"
                    name="busNumber"
                    value={formData.busNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Source</label>
                  <input
                    type="text"
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Destination</label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Departure Time</label>
                  <input
                    type="time"
                    name="departureTime"
                    value={formData.departureTime}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Arrival Time</label>
                  <input
                    type="time"
                    name="arrivalTime"
                    value={formData.arrivalTime}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fare (₹)</label>
                  <input
                    type="number"
                    name="fareInRupees"
                    value={formData.fareInRupees}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bus Type</label>
                  <select
                    name="busType"
                    value={formData.busType}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="AC">AC</option>
                    <option value="Non-AC">Non-AC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Active Status</label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingBus ? 'Update Bus' : 'Add Bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-3">Bus Number</th>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Timings</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Seats</th>
              <th className="px-4 py-3">Fare (₹)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((bus) => (
              <tr key={bus._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{bus.busNumber}</td>
                <td className="px-4 py-3">{`${bus.source} to ${bus.destination}`}</td>
                <td className="px-4 py-3">
                  <div>Departure: {bus.departureTime}</div>
                  <div>Arrival: {bus.arrivalTime}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-sm ${
                    bus.busType === 'AC' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {bus.busType}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>Total: {bus.totalSeats}</div>
                  <div>Layout: {bus.seatArrangement}</div>
                </td>
                <td className="px-4 py-3">{bus.fareInRupees}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-sm ${
                    bus.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {bus.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(bus)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(bus._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Buses;
