import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'
import { CarritoProvider } from './context/CarritoContext'
import { AuthProvider } from './context/AuthContext'

const GOOGLE_CLIENT_ID = '865591412048-8sc25vo3sua4fd9k773gtgk6h8tb29am.apps.googleusercontent.com'

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <BrowserRouter>
        <CarritoProvider>
          <App />
        </CarritoProvider>
      </BrowserRouter>
    </AuthProvider>
  </GoogleOAuthProvider>
)