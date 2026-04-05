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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('SW registered: ', reg.scope);
    }).catch((err) => {
      console.log('SW registration failed: ', err);
    });
  });
}
