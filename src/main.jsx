import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global/variables.css'
import './styles/global/reset.css'
import './styles/global/variables.css'
import './styles/global/reset.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
