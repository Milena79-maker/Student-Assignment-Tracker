import { NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import Home from './core/Home.jsx'
import AssignmentList from './components/assignment-list.jsx'
import AddAssignment from './components/add-assignment.jsx'
import SignIn from './components/sign-in.jsx'
import SignUp from './components/sign-up.jsx'
import UserList from './components/user-list.jsx'
import Profile from './components/profile.jsx'

function Shell() {
  const { user, signOut } = useAuth()

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <NavLink to="/" className="brand" end>
            <img className="brand-logo" src="/logo.webp" alt="Student Assignment Tracker" />
          </NavLink>
          <nav className="nav" aria-label="Main">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/assignments">Assignments</NavLink>
            <NavLink to="/users">Users</NavLink>
            {user ? (
              <>
                <NavLink to="/profile">My Profile</NavLink>
                <button type="button" onClick={signOut}>Sign Out</button>
              </>
            ) : (
              <>
                <NavLink to="/sign-up">Sign Up</NavLink>
                <NavLink to="/sign-in">Sign In</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">Student Assignment Tracker</footer>
    </div>
  )
}

function RequireAuth({ children }) {
  const { user, ready } = useAuth()
  if (!ready) return <p className="status-line">Loading…</p>
  if (!user) return <Navigate to="/sign-in" replace />
  return children
}

const MainRouter = () => (
  <Routes>
    <Route element={<Shell />}>
      <Route index element={<Home />} />
      <Route path="assignments" element={<AssignmentList />} />
      <Route path="assignments/new" element={<RequireAuth><AddAssignment /></RequireAuth>} />
      <Route path="users" element={<UserList />} />
      <Route path="sign-up" element={<SignUp />} />
      <Route path="sign-in" element={<SignIn />} />
      <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
)

export default MainRouter
