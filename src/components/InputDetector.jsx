import React, { useState } from "react";
import useInputMethod from "../hooks/useInputMethod";

const InputDetector = () => {
  const { inputMethod, lastInputMethod } = useInputMethod();
  const [inputValue, setInputValue] = useState("");

  // Determine styling based on input method
  const getInputStyle = () => {
    switch (lastInputMethod) {
      case "Keyboard":
        return { 
          border: "3px solid blue", 
          backgroundColor: "#e3f2fd"  // Light blue for physical keyboard
        };
      case "Touchscreen":
        return { 
          border: "3px solid green", 
          backgroundColor: "#e8f5e9"  // Light green for touch/virtual keyboard
        };
      default:
        return {
          border: "3px solid #ddd",
          backgroundColor: "#fff"
        };
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Input Detection</h2>
      <p>Current Input Method: <strong style={{ color: inputMethod === "Virtual Keyboard" ? "#9b59b6" : "inherit" }}>
        {inputMethod}
      </strong></p>
      <p>Last Used Input Method: <strong>{lastInputMethod || "None"}</strong></p>
      
      <input
        type="text"
        placeholder="Type here to test different input methods..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        style={{
          ...getInputStyle(),
          padding: "10px",
          fontSize: "16px",
          width: "80%",
          maxWidth: "400px",
          borderRadius: "5px",
          outline: "none",
          transition: "all 0.3s ease",
          marginTop: "20px",
        }}
      />

      <div style={{ 
        marginTop: "20px", 
        padding: "15px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        maxWidth: "400px",
        margin: "20px auto"
      }}>
        <h3 style={{ margin: "0 0 10px 0" }}>Input Methods</h3>
        <ul style={{ 
          textAlign: "left", 
          margin: "0",
          paddingLeft: "20px",
          listStyle: "none"
        }}>
          <li>🟦 Blue: Physical keyboard</li>
          <li>🟩 Green: Touch input / Virtual keyboard</li>
          <li>💡 Try the following:</li>
          <li style={{ paddingLeft: "20px" }}>1. Type with physical keyboard</li>
          <li style={{ paddingLeft: "20px" }}>2. Use touch input</li>
          <li style={{ paddingLeft: "20px" }}>3. Open on-screen keyboard (Win + Ctrl + O)</li>
        </ul>
      </div>

      <div style={{
        fontSize: "14px",
        color: "#666",
        marginTop: "10px"
      }}>
        Window Height: {window.innerHeight}px
      </div>
    </div>
  );
};

export default InputDetector;
