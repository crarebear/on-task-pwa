import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { FirebaseProvider } from './context/FirebaseContext'
import { ThemeProvider } from './context/ThemeContext'
import { AppDataProvider } from './context/AppDataContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseProvider>
      <ThemeProvider>
        <AppDataProvider>
          <App />
        </AppDataProvider>
      </ThemeProvider>
    </FirebaseProvider>
  </StrictMode>,
)
