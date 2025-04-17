import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';
// Font Awesome is already imported in index.html

const PrintTicket = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const ticketRef = useRef(null);

  useEffect(() => {
    // Check if required data is available from previous navigation
    const state = location.state;
    console.log('Ticket page state:', state);
    
    if (!state || !state.bookingId) {
      toast.error('No ticket information found');
      navigate('/book');
      return;
    }

    setTicketData(state);
    setLoading(false);
  }, [location.state, navigate]);

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    return timeString;
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
      pdf.save(`EasyBus_Ticket_${ticketData.bookingId}.pdf`);
      
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
            <h2 className="text-2xl font-bold text-gray-900">Your eTicket</h2>
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

          {/* The actual ticket that will be printed/saved */}
          <div className="relative border border-gray-200 rounded-lg overflow-hidden" ref={ticketRef}>
            {/* Ticket Header */}
            <div className="bg-primary text-white p-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="mr-4 bg-white rounded-full p-2 flex items-center justify-center" style={{ width: '50px', height: '50px' }}>
                  <div className="text-primary" style={{ fontSize: '28px' }}>
                    <i className="fas fa-bus"></i>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold">EasyBus</h3>
                  <p className="text-sm opacity-80">Your journey, our responsibility</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80">Booking Date</p>
                <p className="font-semibold">{new Date(ticketData.bookingTime || Date.now()).toLocaleDateString()}</p>
                <p className="text-sm font-bold mt-1">#{generateTicketNumber()}</p>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-6">
              {/* Bus Information */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bus Details</h4>
                  <p className="font-medium text-gray-900">{ticketData.busNumber || 'Unknown'}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Travel Date</h4>
                  <p className="font-medium text-gray-900">{ticketData.travelDate ? formatDate(ticketData.travelDate) : 'Unknown'}</p>
                </div>
                <div className="text-right">
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Ticket Number</h4>
                  <p className="font-medium text-gray-900">{generateTicketNumber()}</p>
                </div>
              </div>

              {/* Journey Information */}
              <div className="mb-6">
                <div className="flex items-center">
                  <div className="w-1/3">
                    <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">From</h4>
                    <p className="text-lg font-medium text-gray-900">{ticketData.source || ticketData.from || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">{ticketData.departureTime ? formatTime(ticketData.departureTime) : (ticketData.time ? formatTime(ticketData.time) : '')}</p>
                  </div>
                  <div className="w-1/3 flex justify-center">
                    <div className="relative w-full h-0.5 bg-gray-300">
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1.5">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      </div>
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1.5">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      </div>
                      <div className="absolute inset-0 flex justify-center items-center">
                        <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="w-1/3 text-right">
                    <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">To</h4>
                    <p className="text-lg font-medium text-gray-900">{ticketData.destination || ticketData.to || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">{ticketData.arrivalTime ? formatTime(ticketData.arrivalTime) : ''}</p>
                  </div>
                </div>
              </div>

              {/* Passenger Information */}
              <div className="mb-6">
                <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Passenger Details</h4>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seat</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ticketData.passengers && Array.isArray(ticketData.passengers) ? (
                        ticketData.passengers.map((passenger, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{passenger.seat}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{passenger.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{passenger.age}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 capitalize">{passenger.gender}</td>
                          </tr>
                        ))
                      ) : (
                        // If no passenger details, show seat information
                        Array.isArray(ticketData.selectedSeats) && ticketData.selectedSeats.map((seat, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{seat}</td>
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
              </ul>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate('/book')}
              className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition"
            >
              Book Another Ticket
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

export default PrintTicket;
