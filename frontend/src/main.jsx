import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Suppress browser extension errors
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('message channel closed')) {
    // Suppress extension communication errors
    event.preventDefault();
    console.debug('Suppressed extension error:', event.reason.message);
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
