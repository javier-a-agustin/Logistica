import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { configureApiClient } from './api/client'
import { sessionStore } from './auth/session'
import App from './App.tsx'
import './index.css'

// Un 401 con token cierra la sesión: ProtectedRoute redirige a /login
configureApiClient({
  getToken: sessionStore.getToken,
  onUnauthorized: () => sessionStore.clear('unauthorized'),
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
