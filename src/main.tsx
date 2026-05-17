import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PluginAPI, PluginContextProvider, PluginRouter } from '@harnessio/idp-plugins-sdk'

document.addEventListener('DOMContentLoaded', () => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <PluginContextProvider>
        <PluginRouter>
          <App />
        </PluginRouter>
      </PluginContextProvider>
    </StrictMode>
  )

  setTimeout(() => {
    PluginAPI.init()
  }, 0)
})
