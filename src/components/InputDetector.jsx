import React, { useState } from 'react';
import useInputMethod from '../hooks/useInputMethod';

const InputDetector = () => {
  const [inputValue, setInputValue] = useState('');
  const { inputMethod, hasInteracted } = useInputMethod();

  const getInputStyle = () => {
    const style = {
      padding: '10px',
      margin: '10px 0',
      fontSize: '16px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      width: '100%',
      maxWidth: '400px',
      boxSizing: 'border-box'
    };

    if (inputMethod === "Physical Keyboard") {
      style.border = '2px solid #4CAF50';
      style.backgroundColor = '#f1f8e9';
    } else if (inputMethod === "Virtual Keyboard") {
      style.border = '2px solid #2196F3';
      style.backgroundColor = '#e3f2fd';
    } else if (inputMethod === "Stylus") {
      style.border = '2px solid #9C27B0';
      style.backgroundColor = '#f3e5f5';
    }

    return style;
  };

  const getMessageStyle = (isPrompt) => ({
    padding: '10px',
    margin: '10px 0',
    borderRadius: '4px',
    backgroundColor: isPrompt ? '#fff3e0' : '#e8f5e9',
    color: isPrompt ? '#e65100' : '#2e7d32',
    border: `1px solid ${isPrompt ? '#ffe0b2' : '#c8e6c9'}`,
    fontWeight: isPrompt ? 'bold' : 'normal',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
    boxSizing: 'border-box'
  });

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      boxSizing: 'border-box',
      fontFamily: 'Arial, sans-serif',
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: '0 0 20px 0' }}>Input Method Detector</h2>
        
        <div style={{
          width: '100%',
          maxWidth: '400px',
          marginBottom: '20px',
          boxSizing: 'border-box'
        }}>
          {!hasInteracted ? (
            <div style={getMessageStyle(true)}>
              Please enter any key to detect your keyboard type
            </div>
          ) : (
            <div style={getMessageStyle(false)}>
              Current Input Method: {inputMethod}
            </div>
          )}
        </div>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type something here..."
          style={getInputStyle()}
        />
      </div>
    </div>
  );
};

export default InputDetector;
