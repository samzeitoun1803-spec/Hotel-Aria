import '@fontsource-variable/inter-tight'
import '@fontsource-variable/inter'
import './index.css'
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// En production, la page est pré-rendue (scripts/prerender.mjs) : on hydrate le HTML existant.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
