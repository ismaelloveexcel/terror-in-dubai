/**
 * SAVE ISMAEL - Entry Point
 * A gift from Uncle Ismael to Aidan
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Console branding
console.log('%c SAVE ISMAEL ', 'background: #cc0000; color: white; font-size: 24px; font-weight: bold;');
console.log('%c An Upside Down Dubai Adventure ', 'background: #00cccc; color: black; font-size: 14px;');
console.log('%c For Aidan, from Mammoo Ismael ', 'color: #666; font-style: italic;');

// Mount the app
const rootElement = document.getElementById('app');

if (!rootElement) {
    throw new Error('Root element "#app" not found');
}

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
