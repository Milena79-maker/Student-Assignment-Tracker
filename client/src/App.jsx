import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './auth.jsx'
import MainRouter from './MainRouter.jsx'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  </BrowserRouter>
)

export default App
