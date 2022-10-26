import { Leva } from 'leva'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Leva collapsed={true} />
    <App />
  </React.StrictMode>
)
