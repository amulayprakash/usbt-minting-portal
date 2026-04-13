import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Suppress unhandled promise rejections from browser wallet extensions
// (TronLink, Tonkeeper, etc.) polling their background service workers.
// These are extension-internal errors and do not affect app functionality.
window.addEventListener('unhandledrejection', (e) => {
  const msg: string = e.reason?.message ?? String(e.reason ?? '');
  if (
    msg.includes('Could not establish connection') ||
    msg.includes('Receiving end does not exist') ||
    msg.includes('Origin not allowed')
  ) {
    e.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
