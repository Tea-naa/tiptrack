// Entry point for React app: renders the App component into the HTML
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/App.css'

// Get the root div from index.html | where React injects the app
const root = document.getElementById('root')

// Render app componet
ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)