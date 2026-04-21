import { useState } from 'react'
import './App.css'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import AdminSignUp from './pages/AdminSignUp'
import Dashboard from './pages/Dashboard'
import UserDashboard from './pages/UserDashboard'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentPage, setCurrentPage] = useState('signin')

  return isLoggedIn ? (
    isAdmin ? (
      <Dashboard setIsLoggedIn={setIsLoggedIn} isAdmin={isAdmin} />
    ) : (
      <UserDashboard setIsLoggedIn={setIsLoggedIn} />
    )
  ) : currentPage === 'adminsignup' ? (
    <AdminSignUp setIsLoggedIn={setIsLoggedIn} setCurrentPage={setCurrentPage} setIsAdmin={setIsAdmin} />
  ) : currentPage === 'signup' ? (
    <SignUp setIsLoggedIn={setIsLoggedIn} setCurrentPage={setCurrentPage} />
  ) : (
    <SignIn setIsLoggedIn={setIsLoggedIn} isAdmin={isAdmin} setIsAdmin={setIsAdmin} setCurrentPage={setCurrentPage} />
  )
}

export default App
