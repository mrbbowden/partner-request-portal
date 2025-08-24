import React from "react";

const TestComponent = () => {
  console.log("NEW TEST COMPONENT RENDERING");
  
  return (
    <div style={{ 
      backgroundColor: 'orange', 
      padding: '20px', 
      border: '5px solid purple',
      margin: '20px 0',
      fontSize: '20px',
      fontWeight: 'bold'
    }}>
      <h1 style={{ color: 'purple', fontSize: '30px' }}>NEW TEST COMPONENT</h1>
      <p style={{ color: 'black' }}>This is a completely new test component!</p>
      
      <button
        onClick={() => alert("NEW TEST BUTTON WORKS!")}
        style={{ 
          padding: '15px 30px', 
          backgroundColor: 'purple', 
          color: 'white', 
          border: 'none',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        NEW TEST BUTTON
      </button>
    </div>
  );
};

export default TestComponent;
