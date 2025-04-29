import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// Apply stored theme before rendering to avoid flash of incorrect theme
const storedTheme = localStorage.getItem('theme');
if (storedTheme) {
  document.documentElement.setAttribute('data-theme', storedTheme);
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
