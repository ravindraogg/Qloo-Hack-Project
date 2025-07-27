import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; 
import { LenisProvider } from './LenisContext.jsx';
import { Analytics } from "@vercel/analytics/react"
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LenisProvider>
      <App />
    </LenisProvider>
    <Analytics/>
  </React.StrictMode>,
);