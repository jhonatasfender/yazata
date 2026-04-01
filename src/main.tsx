import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProviderWithRouter } from './components/clerk-provider-with-router'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ClerkProviderWithRouter />
  </BrowserRouter>,
)
