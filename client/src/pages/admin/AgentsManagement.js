import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/axios';

const AgentsManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [agents, setAgents] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    agencyName: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    windowNumber: '',
    gstNumber: '',
    panNumber: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    commissionRate: '',
    userId: '',
    password: '',
    confirmPassword: '',
    logo: null
  });

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    return `http://localhost:5001${logoPath}`;
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await api.get('/agents');
      console.log('Fetched agents:', response.data);
      setAgents(response.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
      } else {
        toast.error('Failed to fetch agents: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      // Validate required fields
      const requiredFields = {
        agencyName: 'Agency Name',
        ownerName: 'Owner Name',
        phone: 'Phone Number',
        email: 'Email',
        address: 'Address',
        windowNumber: 'Window Number',
        panNumber: 'PAN Number',
        bankName: 'Bank Name',
        accountNumber: 'Account Number',
        ifscCode: 'IFSC Code',
        commissionRate: 'Commission Rate',
        userId: 'User ID',
        password: 'Password'
      };

      for (const [field, label] of Object.entries(requiredFields)) {
        if (!formData[field]) {
          toast.error(`${label} is required`);
          return;
        }
      }

      // Validate phone number
      if (!/^\d{10}$/.test(formData.phone)) {
        toast.error('Please enter a valid 10-digit phone number');
        return;
      }

      // Validate email
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      // Validate commission rate
      const commission = parseFloat(formData.commissionRate);
      if (isNaN(commission) || commission < 0 || commission > 100) {
        toast.error('Commission rate must be between 0 and 100');
        return;
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'logo' && formData[key]) {
          formDataToSend.append('logo', formData[key]);
        } else if (key !== 'confirmPassword') {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await api.post('/admin/agents', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Added agent:', response.data);
      toast.success('Agent added successfully!');
      setShowAddForm(false);
      fetchAgents();
      setFormData({
        agencyName: '',
        ownerName: '',
        phone: '',
        email: '',
        address: '',
        windowNumber: '',
        gstNumber: '',
        panNumber: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        commissionRate: '',
        userId: '',
        password: '',
        confirmPassword: '',
        logo: null
      });
    } catch (error) {
      console.error('Error adding agent:', error);
      toast.error(error.response?.data?.message || 'Failed to add agent');
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('Logo file size must be less than 5MB');
        e.target.value = '';
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        toast.error('Logo must be a JPG, JPEG, or PNG file');
        e.target.value = '';
        return;
      }
      setFormData(prev => ({ ...prev, logo: file }));
    }
  };

  const handleStatusChange = async (agentId, newStatus) => {
    try {
      await api.patch(`/admin/agents/${agentId}/status`, { status: newStatus });
      console.log('Updated agent status:', newStatus);
      toast.success('Agent status updated successfully');
      fetchAgents(); // Refresh the agents list
    } catch (error) {
      console.error('Error updating agent status:', error);
      toast.error(error.response?.data?.message || 'Failed to update agent status');
    }
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    setFormData({
      agencyName: agent.agencyName,
      ownerName: agent.ownerName,
      phone: agent.phone,
      email: agent.email,
      address: agent.address,
      windowNumber: agent.windowNumber,
      gstNumber: agent.gstNumber || '',
      panNumber: agent.panNumber,
      bankName: agent.bankName,
      accountNumber: agent.accountNumber,
      ifscCode: agent.ifscCode,
      commissionRate: agent.commissionRate,
      userId: agent.userId,
      password: '',
      confirmPassword: '',
      logo: null
    });
    setShowEditForm(true);
  };

  const handleDelete = async (agentId) => {
    if (window.confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/agents/${agentId}`);
        console.log('Deleted agent:', agentId);
        toast.success('Agent deleted successfully');
        fetchAgents();
      } catch (error) {
        console.error('Error deleting agent:', error);
        toast.error(error.response?.data?.message || 'Failed to delete agent');
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (formData.password && formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'logo' && formData[key]) {
          formDataToSend.append('logo', formData[key]);
        } else if (key !== 'confirmPassword') {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await api.patch(`/admin/agents/${editingAgent._id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Updated agent:', response.data);
      toast.success('Agent updated successfully');
      setShowEditForm(false);
      setEditingAgent(null);
      fetchAgents();
      setFormData({
        agencyName: '',
        ownerName: '',
        phone: '',
        email: '',
        address: '',
        windowNumber: '',
        gstNumber: '',
        panNumber: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        commissionRate: '',
        userId: '',
        password: '',
        confirmPassword: '',
        logo: null
      });
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error(error.response?.data?.message || 'Failed to update agent');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Agent Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <i className="fas fa-plus"></i>
          <span>Add New Agent</span>
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add New Agent</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Agency Name *</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={formData.agencyName}
                        onChange={(e) => setFormData({...formData, agencyName: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Owner Name *</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={formData.ownerName}
                        onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        className="w-full border rounded p-2"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                        pattern="[0-9]{10}"
                        title="Please enter a valid 10-digit phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Email *</label>
                      <input
                        type="email"
                        className="w-full border rounded p-2"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Address *</label>
                      <textarea
                        className="w-full border rounded p-2"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        required
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Window Number *</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={formData.windowNumber}
                        onChange={(e) => setFormData({...formData, windowNumber: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>

                    <div>
                      <label className="block text-sm font-medium mb-1">GST Number</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={formData.gstNumber}
                        onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">PAN Number *</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={formData.panNumber}
                        onChange={(e) => setFormData({...formData, panNumber: e.target.value})}
                        required
                        pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                        title="Please enter a valid PAN number (e.g., ABCDE1234F)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Bank Name *</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={formData.bankName}
                        onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Account Number *</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                        required
                        pattern="[0-9]{9,18}"
                        title="Please enter a valid account number (9-18 digits)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">IFSC Code *</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={formData.ifscCode}
                        onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
                        required
                        pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
                        title="Please enter a valid IFSC code (e.g., SBIN0123456)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Commission Rate (%) *</label>
                      <input
                        type="number"
                        className="w-full border rounded p-2"
                        value={formData.commissionRate}
                        onChange={(e) => setFormData({...formData, commissionRate: e.target.value})}
                        required
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {/* Login Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Login Information</h3>

                    <div>
                      <label className="block text-sm font-medium mb-1">User ID *</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={formData.userId}
                        onChange={(e) => setFormData({...formData, userId: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full border rounded p-2 pr-10"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          required
                          minLength="8"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-2 text-gray-500"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="w-full border rounded p-2 pr-10"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          required
                          minLength="8"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-2 text-gray-500"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Agency Logo</h3>
                    <div>
                      <label className="block text-sm font-medium mb-1">Upload Logo</label>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleLogoChange}
                        className="w-full border rounded p-2"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Max size: 5MB. Supported formats: JPG, JPEG, PNG
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Add Agent
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Agents List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Window</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agents.map((agent) => (
                <tr key={agent._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {agent.logo && (
                        <img
                          src={getLogoUrl(agent.logo)}
                          alt={agent.agencyName}
                          className="h-10 w-10 rounded-full object-cover mr-3"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/64?text=Logo';
                          }}
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{agent.agencyName}</div>
                        <div className="text-sm text-gray-500">{agent.agentId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{agent.ownerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{agent.phone}</div>
                    <div className="text-sm text-gray-500">{agent.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {agent.windowNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${agent.status === 'active' ? 'bg-green-100 text-green-800' : 
                        agent.status === 'suspended' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3 flex items-center">
                    <select
                      value={agent.status}
                      onChange={(e) => handleStatusChange(agent._id, e.target.value)}
                      className="text-sm border rounded px-2 py-1 bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    <button
                      onClick={() => handleEdit(agent)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit Agent"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(agent._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Agent"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Edit Agent</h2>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingAgent(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Agency Name *</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={formData.agencyName}
                        onChange={(e) => setFormData({...formData, agencyName: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Owner Name *</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={formData.ownerName}
                        onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        className="w-full border rounded p-2"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                        pattern="[0-9]{10}"
                        title="Please enter a valid 10-digit phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Email *</label>
                      <input
                        type="email"
                        className="w-full border rounded p-2"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Address *</label>
                      <textarea
                        className="w-full border rounded p-2"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        required
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Window Number *</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={formData.windowNumber}
                        onChange={(e) => setFormData({...formData, windowNumber: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>

                    <div>
                      <label className="block text-sm font-medium mb-1">GST Number</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={formData.gstNumber}
                        onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">PAN Number *</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={formData.panNumber}
                        onChange={(e) => setFormData({...formData, panNumber: e.target.value})}
                        required
                        pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                        title="Please enter a valid PAN number (e.g., ABCDE1234F)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Bank Name *</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={formData.bankName}
                        onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Account Number *</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                        required
                        pattern="[0-9]{9,18}"
                        title="Please enter a valid account number (9-18 digits)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">IFSC Code *</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={formData.ifscCode}
                        onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
                        required
                        pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
                        title="Please enter a valid IFSC code (e.g., SBIN0123456)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Commission Rate (%) *</label>
                      <input
                        type="number"
                        className="w-full border rounded p-2"
                        value={formData.commissionRate}
                        onChange={(e) => setFormData({...formData, commissionRate: e.target.value})}
                        required
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {/* Login Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Login Information</h3>

                    <div>
                      <label className="block text-sm font-medium mb-1">User ID *</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={formData.userId}
                        onChange={(e) => setFormData({...formData, userId: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full border rounded p-2 pr-10"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          required
                          minLength="8"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-2 text-gray-500"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="w-full border rounded p-2 pr-10"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          required
                          minLength="8"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-2 text-gray-500"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Agency Logo</h3>
                    <div>
                      <label className="block text-sm font-medium mb-1">Upload Logo</label>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleLogoChange}
                        className="w-full border rounded p-2"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Max size: 5MB. Supported formats: JPG, JPEG, PNG
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingAgent(null);
                    }}
                    className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Update Agent
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentsManagement;
