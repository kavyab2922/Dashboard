import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <ThemeProvider>
      <App />
      <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1e1b4b',
          color: '#e0e7ff',
          borderRadius: '12px',
          border: '1px solid rgba(99,102,241,0.3)',
        },
      }}
      />
    </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>,
)
