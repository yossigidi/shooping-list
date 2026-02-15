import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Hide loading skeleton when React mounts
const hideLoadingSkeleton = () => {
  const skeleton = document.getElementById('loading-skeleton');
  if (skeleton) {
    skeleton.style.opacity = '0';
    skeleton.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => skeleton.remove(), 300);
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hide skeleton after React renders
requestAnimationFrame(() => {
  requestAnimationFrame(hideLoadingSkeleton);
});
