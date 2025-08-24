import React, { useState } from "react";

export default function CookieTest() {
  const [testValue, setTestValue] = useState("test");

  const handleClick = () => {
    alert("Button clicked! Test value: " + testValue);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cookie Test Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Simple Test:</h2>
          <p>If you can see this, React is working!</p>
        </div>

        <div className="p-4 bg-blue-50 rounded">
          <h2 className="font-semibold mb-2">Test Input:</h2>
          <input
            type="text"
            value={testValue}
            onChange={(e) => setTestValue(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="Type something"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleClick}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Button
          </button>
        </div>

        <div className="p-4 bg-yellow-50 rounded">
          <h2 className="font-semibold mb-2">Current Value:</h2>
          <p>{testValue}</p>
        </div>

        <div className="p-4 bg-green-50 rounded">
          <h2 className="font-semibold mb-2">Navigation:</h2>
          <a 
            href="/" 
            className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            Go to Main App
          </a>
        </div>
      </div>
    </div>
  );
}
