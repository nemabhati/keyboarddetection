import React, { useState } from 'react';
import useInputMethod from '../hooks/useInputMethod';

const InputDetector = () => {
  const [inputValue, setInputValue] = useState('');
  const { inputMethod } = useInputMethod();

  const getInputStyle = () => {
    const style = {
      padding: '10px',
      margin: '10px',
      width: '80%',
      maxWidth: '400px',
      fontSize: '16px',
      borderRadius: '8px',
      transition: 'all 0.3s ease'
    };

    const colors = {
      'Physical Keyboard': { border: '#4a90e2', bg: '#f0f8ff' },
      'Virtual Keyboard': { border: '#9b59b6', bg: '#f5eef8' },
      'Touchscreen': { border: '#2ecc71', bg: '#eafaf1' },
      'Mouse': { border: '#e67e22', bg: '#fef5e7' },
      'Stylus': { border: '#e74c3c', bg: '#fdedec' }
    };

    const color = colors[inputMethod] || { border: '#95a5a6', bg: '#f8f9f9' };
    return {
      ...style,
      border: `2px solid ${color.border}`,
      backgroundColor: color.bg
    };
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h2>Input Method Detector</h2>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type something here..."
        style={getInputStyle()}
      />
      <div style={{
        marginTop: '20px',
        padding: '15px',
        borderRadius: '8px',
        backgroundColor: '#f8f9f9',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '80%'
      }}>
        <p>Current Input Method: {inputMethod}</p>
      </div>
    </div>
  );
};

export default InputDetector;
