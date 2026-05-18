import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { UpgradeModalProvider } from './context/UpgradeModalContext'
import App from './App'
import UpgradeModal from './components/UpgradeModal'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <UpgradeModalProvider>
        <App />
        <UpgradeModal />
      </UpgradeModalProvider>
    </AuthProvider>
  </BrowserRouter>
)