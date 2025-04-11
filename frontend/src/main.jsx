import React from 'react'
import ReactDOM from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { AudioProvider } from './context/AudioContext'
import App from './App'
import './index.css'
import { Buffer } from 'buffer';
window.Buffer = Buffer;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MemoryRouter>
      <AudioProvider>
        <App />
      </AudioProvider>
    </MemoryRouter>
  </React.StrictMode>
)
