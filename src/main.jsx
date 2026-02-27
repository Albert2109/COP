import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
/** * Note: Imports of CookieConsent and PrivacyFooter are available here 
 * if global injection outside the App component is required.
 */
import CookieConsent from './components/CookieConsent.jsx';
import PrivacyFooter from './components/PrivacyFooter.jsx';
import App from './App.jsx';
import './index.css'; 

/**
 * Application Entry Point.
 * Initializing the React root element and mounting the application.
 * * - **ReactDOM.createRoot**: Modern React 18 API for concurrent rendering.
 * - **React.StrictMode**: Development tool to highlight potential problems.
 * - **BrowserRouter**: Provides the navigation context for the entire application,
 * enabling the use of 'react-router-dom' hooks and components.
 * * 
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* The main App component containing all routes and global state logic */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);