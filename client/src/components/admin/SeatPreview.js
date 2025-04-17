import React, { useState, useEffect } from 'react';

const SeatPreview = ({ onConfigChange, initialConfig }) => {
  const [config, setConfig] = useState({
    seatArrangement: '2-2',
    firstRowSeats: 2,
    lastRowSeats: 3,
    totalRows: 10,
    busType: 'AC'
  });

  useEffect(() => {
    if (initialConfig) {
      setConfig(prev => ({
        ...prev,
        ...initialConfig
      }));
    }
  }, [initialConfig]);

  const getSeatConfiguration = () => {
    const [left, right] = config.seatArrangement.split('-').map(Number);
    return { left, right };
  };

  const renderSeat = (seatNumber, isSpecial = false) => (
    <div
      key={seatNumber}
      className={`w-8 h-8 m-1 rounded flex items-center justify-center text-xs cursor-pointer transition-colors
        ${isSpecial ? 'bg-blue-200 hover:bg-blue-300 border border-blue-400' : 'bg-gray-200 hover:bg-gray-300 border border-gray-400'}
      `}
      title={`Seat ${seatNumber}`}
    >
      {seatNumber}
    </div>
  );

  const renderRow = (rowIndex, seatConfig) => {
    const seats = [];
    const isFirstRow = rowIndex === 0;
    const isLastRow = rowIndex === config.totalRows - 1;
    const totalSeatsInRow = isFirstRow ? config.firstRowSeats : 
                           isLastRow ? config.lastRowSeats : 
                           seatConfig.left + seatConfig.right;

    const startSeatNumber = rowIndex * (seatConfig.left + seatConfig.right) + 1;
    
    if (isFirstRow || isLastRow) {
      for (let i = 0; i < totalSeatsInRow; i++) {
        seats.push(renderSeat(startSeatNumber + i, true));
      }
    } else {
      // Left side seats
      for (let i = 0; i < seatConfig.left; i++) {
        seats.push(renderSeat(startSeatNumber + i));
      }
      
      // Aisle
      seats.push(
        <div key="aisle" className="w-8 flex items-center justify-center">
          <div className="w-2 h-8 bg-gray-400 rounded"></div>
        </div>
      );
      
      // Right side seats
      for (let i = 0; i < seatConfig.right; i++) {
        seats.push(renderSeat(startSeatNumber + seatConfig.left + i));
      }
    }

    return (
      <div key={rowIndex} className="flex justify-center items-center my-1">
        {seats}
      </div>
    );
  };

  const handleConfigChange = (field, value) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    
    // Calculate total seats
    const seatConfig = getSeatConfiguration();
    const totalSeats = (newConfig.totalRows - 2) * (seatConfig.left + seatConfig.right) + 
                      parseInt(newConfig.firstRowSeats) + 
                      parseInt(newConfig.lastRowSeats);
    
    if (onConfigChange) {
      onConfigChange({
        ...newConfig,
        totalSeats
      });
    }
  };

  const seatConfig = getSeatConfiguration();
  const rows = [];

  for (let i = 0; i < config.totalRows; i++) {
    rows.push(renderRow(i, seatConfig));
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Seat Layout Preview</h2>
        
        {/* Configuration Controls */}
        <div className="space-y-3 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seat Arrangement
            </label>
            <select
              value={config.seatArrangement}
              onChange={(e) => handleConfigChange('seatArrangement', e.target.value)}
              className="w-full border rounded p-2 text-sm"
            >
              <option value="1-1">1-1 (2 seats per row)</option>
              <option value="2-1">2-1 (3 seats per row)</option>
              <option value="2-2">2-2 (4 seats per row)</option>
              <option value="3-2">3-2 (5 seats per row)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Row Seats
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={config.firstRowSeats}
                onChange={(e) => handleConfigChange('firstRowSeats', parseInt(e.target.value))}
                className="w-full border rounded p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Row Seats
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={config.lastRowSeats}
                onChange={(e) => handleConfigChange('lastRowSeats', parseInt(e.target.value))}
                className="w-full border rounded p-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Rows
            </label>
            <input
              type="number"
              min="5"
              max="15"
              value={config.totalRows}
              onChange={(e) => handleConfigChange('totalRows', parseInt(e.target.value))}
              className="w-full border rounded p-2 text-sm"
            />
          </div>
        </div>

        {/* Seat Layout */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex flex-col items-center">
            {/* Driver's cabin */}
            <div className="w-20 h-12 bg-gray-300 rounded-t-lg mb-4 flex items-center justify-center text-sm text-gray-600">
              Driver
            </div>
            {/* Seats */}
            {rows}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded mr-2"></div>
            <span>Regular Seat</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded mr-2"></div>
            <span>Special Row Seat</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatPreview;
