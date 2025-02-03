import React, { useState } from 'react';
import useInputMethod from '../hooks/useInputMethod';

const InputDetector = () => {
  const [inputValue, setInputValue] = useState('');
  const { inputMethod, deviceType } = useInputMethod();

  const getInputStyle = () => {
    const baseStyle = {
      padding: '10px',
      margin: '10px',
      width: '80%',
      maxWidth: '400px',
      fontSize: '16px',
      borderRadius: '8px',
      transition: 'all 0.3s ease'
    };

    switch (inputMethod) {
      case 'Physical Keyboard':
        return {
          ...baseStyle,
          border: '2px solid #4a90e2',
          backgroundColor: '#f0f8ff'
        };
      case 'Virtual Keyboard':
        return {
          ...baseStyle,
          border: '2px solid #9b59b6',
          backgroundColor: '#f5eef8'
        };
      case 'Touchscreen':
        return {
          ...baseStyle,
          border: '2px solid #2ecc71',
          backgroundColor: '#eafaf1'
        };
      case 'Mouse':
        return {
          ...baseStyle,
          border: '2px solid #e67e22',
          backgroundColor: '#fef5e7'
        };
      case 'Stylus':
        return {
          ...baseStyle,
          border: '2px solid #e74c3c',
          backgroundColor: '#fdedec'
        };
      default:
        return {
          ...baseStyle,
          border: '2px solid #95a5a6',
          backgroundColor: '#f8f9f9'
        };
    }
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const infoStyle = {
    marginTop: '20px',
    padding: '15px',
    borderRadius: '8px',
    backgroundColor: '#f8f9f9',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    maxWidth: '400px',
    width: '80%'
  };

  const labelStyle = {
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: '8px'
  };

  const valueStyle = {
    color: '#34495e'
  };

  return (
    <div style={containerStyle}>
      <h2>Input Method Detector</h2>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type something here..."
        style={getInputStyle()}
      />
      <div style={infoStyle}>
        <p>
          <span style={labelStyle}>Device Type:</span>
          <span style={valueStyle}>{deviceType}</span>
        </p>
        <p>
          <span style={labelStyle}>Current Input Method:</span>
          <span style={valueStyle}>{inputMethod}</span>
        </p>
      </div>
      <div style={{...infoStyle, marginTop: '10px'}}>
        <h3 style={{margin: '0 0 10px 0', color: '#2c3e50'}}>Color Guide:</h3>
        <p style={{margin: '5px 0'}}>🔵 Blue - Physical Keyboard</p>
        <p style={{margin: '5px 0'}}>💜 Purple - Virtual Keyboard</p>
        <p style={{margin: '5px 0'}}>💚 Green - Touchscreen</p>
        <p style={{margin: '5px 0'}}>🟧 Orange - Mouse</p>
        <p style={{margin: '5px 0'}}>❤️ Red - Stylus</p>
      </div>
    </div>
  );
};

export default InputDetector;
