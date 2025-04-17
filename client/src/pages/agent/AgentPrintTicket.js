import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';
import axios from '../../utils/axios';

const AgentPrintTicket = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [ticketData, setTicketData] = useState(null);
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const ticketRef = useRef(null);

  useEffect(() => {
    // Check if required data is available from previous navigation
    const state = location.state;
    console.log('Agent Ticket page state:', state);
    
    if (!state || !state.bookingId) {
      toast.error('No ticket information found');
      navigate('/agent/dashboard');
      return;
    }

    // Get agent information from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || !user.id) {
      toast.error('Agent information not found');
      navigate('/agent-login');
      return;
    }

    // Fetch agent data
    const fetchAgentData = async () => {
      try {
        const response = await axios.get(`/agents/${user.id}`);
        if (response.data) {
          setAgentData({
            ...response.data,
            // Set default logo if none exists
            logo: response.data.logo || 'https://via.placeholder.com/150?text=Travel+Agency'
          });
        }
      } catch (error) {
        console.error('Error fetching agent data:', error);
        toast.error('Failed to load agent details');
      }
    };

    fetchAgentData();
    setTicketData(state);
    setLoading(false);
  }, [location.state, navigate]);

  const formatDate = (dateString) => {
    try {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString || 'N/A';
    }
  };

  const formatTime = (timeString) => {
    return timeString || 'N/A';
  };

  const downloadTicketAsPDF = () => {
    if (!ticketRef.current) return;

    html2canvas(ticketRef.current, {
      scale: 2,
      useCORS: true,
      logging: false
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`EasyBus_Agent_Ticket_${ticketData.bookingId}.pdf`);
      
      toast.success('Ticket downloaded successfully!');
    });
  };

  const printTicket = () => {
    window.print();
  };

  const generateTicketNumber = () => {
    return `EB${ticketData.bookingId.substring(0, 6).toUpperCase()}`;
  };

  if (loading || !ticketData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Agent Booking eTicket</h2>
            <div className="flex space-x-4">
              <button
                onClick={printTicket}
                className="px-4 py-2 bg-gray-800 text-white rounded-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              <button
                onClick={downloadTicketAsPDF}
                className="px-4 py-2 bg-primary text-white rounded-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>

          <div id="ticket" ref={ticketRef} className="border border-gray-200 rounded-lg overflow-hidden relative print:shadow-none">
            {/* Ticket Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-blue-50">
              <div className="flex items-center">
                <div className="text-3xl font-bold text-primary mr-2">
                  <i className="fas fa-bus"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">EasyBus</h3>
                  <p className="text-sm text-gray-600">Your Reliable Travel Partner</p>
                </div>
              </div>

              {/* Agent Information - New Section */}
              {agentData && (
                <div className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="mr-3">
                    <img 
                      src={agentData.logo} 
                      alt="Agent Logo" 
                      className="h-16 w-16 object-contain rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/150?text=Travel+Agency";
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{agentData.agencyName}</h4>
                    <p className="text-xs text-gray-600">Authorized EasyBus Agent</p>
                    <p className="text-xs text-gray-600">Window: {agentData.windowNumber}</p>
                    <p className="text-xs text-gray-600">Contact: {agentData.phone}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Ticket Body */}
            <div className="px-6 py-4">
              <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Journey Details */}
                  <div className="flex-1">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h3 className="font-bold text-gray-900 mb-3 border-b pb-1">Journey Details</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">From</p>
                          <p className="font-semibold text-gray-900">{ticketData.from || ticketData.source}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">To</p>
                          <p className="font-semibold text-gray-900">{ticketData.to || ticketData.destination}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="font-semibold text-gray-900">{formatDate(ticketData.date)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Time</p>
                          <p className="font-semibold text-gray-900">{formatTime(ticketData.departureTime)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Bus Number</p>
                          <p className="font-semibold text-gray-900">{ticketData.busNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Seat(s)</p>
                          <p className="font-semibold text-gray-900">{ticketData.seats ? ticketData.seats.join(', ') : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Fare Details */}
                  <div className="flex-1">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h3 className="font-bold text-gray-900 mb-3 border-b pb-1">Fare Details</h3>
                      
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Base Fare</span>
                        <span className="text-gray-900">₹{(ticketData.fareInRupees * 0.9).toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Taxes & Fees</span>
                        <span className="text-gray-900">₹{(ticketData.fareInRupees * 0.1).toFixed(2)}</span>
                      </div>
                      
                      <div className="border-t border-gray-200 my-2"></div>
                      
                      <div className="flex justify-between font-bold">
                        <span>Total Amount</span>
                        <span>₹{ticketData.fareInRupees}</span>
                      </div>
                      
                      <div className="mt-4 pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-500">Payment Status</div>
                        <div className="flex items-center">
                          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                          <span className="font-medium text-green-600">PAID</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passenger Details */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Passenger Information</h3>
                <div className="bg-white overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ticketData.passengers && ticketData.passengers.length > 0 ? (
                        ticketData.passengers.map((passenger, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{passenger.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{passenger.age}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{passenger.gender}</td>
                          </tr>
                        ))
                      ) : (
                        // Fallback if passenger data is not available
                        (ticketData.selectedSeats || ticketData.seats || []).map((seat, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Passenger {index + 1}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">-</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">-</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ticket Footer */}
              <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
                <div>
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Booking ID</h4>
                  <p className="font-mono font-medium text-gray-900">{generateTicketNumber()}</p>
                  <p className="text-xs text-gray-500 mt-1">Ref: {ticketData.bookingId}</p>
                </div>
                <div className="text-center">
                  <div className="mb-1">
                    <QRCodeSVG
                      value={`EASYBUS-TICKET-${ticketData.bookingId}`}
                      size={120}
                      level="H"
                      includeMargin={true}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Scan for verification</p>
                  <p className="text-xs font-medium text-primary mt-1">Verified Digital Ticket</p>
                </div>
              </div>
              
              {/* Agent Stamp - Bottom Right */}
              {agentData && (
                <div className="absolute bottom-4 right-6">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Booked by</div>
                    <div className="font-mono text-sm font-bold text-gray-800">{agentData.agencyName}</div>
                    <div className="text-xs text-gray-600">Agent ID: {agentData.agentId}</div>
                  </div>
                </div>
              )}
              
              {/* Watermark Diagonal */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none overflow-hidden">
                <div className="transform rotate-45">
                  <h1 className="text-9xl font-extrabold text-gray-500 whitespace-nowrap">EASYBUS</h1>
                </div>
              </div>
            </div>
          </div>

          {/* Environmental Message */}
          <div className="mt-4 flex items-center px-4 py-3 bg-green-50 rounded-md text-green-800 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p>
              <span className="font-semibold">Go Green!</span> Please avoid printing this ticket unless necessary. Save a tree, show your e-ticket directly from your device. Your small action makes a big difference to our planet.
            </p>
          </div>

          {/* Important Information */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Important Information</h3>
            <div className="bg-blue-50 p-4 rounded-md text-sm text-gray-700">
              <ul className="list-disc pl-5 space-y-2">
                <li>Please arrive at the bus stop at least 30 minutes before the departure time.</li>
                <li>Present this e-ticket (printed or digital) along with a valid ID proof at the time of boarding.</li>
                <li>Bus timings are subject to traffic and weather conditions.</li>
                <li>For any assistance, please contact our helpline at 1800-123-4567.</li>
                <li>For agent-related queries, please contact your booking agent at the number provided on the ticket.</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate('/agent/dashboard')}
              className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Thank you for choosing EasyBus for your journey!</p>
        </div>
      </div>
    </div>
  );
};

export default AgentPrintTicket;
