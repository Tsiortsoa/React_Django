import { BrowserRouter } from 'react-router-dom'

import { AuthProvider } from './context/AuthProvider'
import { ConfirmationProvider } from './context/ConfirmationProvider'
import { ToastProvider } from './context/ToastProvider'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ConfirmationProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ConfirmationProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App