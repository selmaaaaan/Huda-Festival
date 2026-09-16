import React from "react";
import ReactDOM from 'react-dom/client'
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import { MotionConfig } from 'framer-motion';
import { ConfirmProvider } from './context/ConfirmContext';
import { AlertProvider } from './context/AlertContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <ConfirmProvider>
        <AlertProvider>
          <BrowserRouter><App /></BrowserRouter>
        </AlertProvider>
      </ConfirmProvider>
    </MotionConfig>
  </React.StrictMode>
)