import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Make sure your main CSS is imported
import { LenisProvider } from './LenisContext.jsx'; // Import the provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LenisProvider>
      <App />
    </LenisProvider>
  </React.StrictMode>,
);