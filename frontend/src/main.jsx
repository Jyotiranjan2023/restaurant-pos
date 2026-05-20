import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SuperAdminAuthProvider } from './context/SuperAdminAuthContext';
import { AuthProvider } from './context/AuthContext'
import { UpgradeModalProvider } from './context/UpgradeModalContext'
import App from './App'
import UpgradeModal from './components/UpgradeModal'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
     <SuperAdminAuthProvider>
    <UpgradeModalProvider>
        <App />
        <UpgradeModal />
    </UpgradeModalProvider>
</SuperAdminAuthProvider>
    </AuthProvider>
  </BrowserRouter>
)