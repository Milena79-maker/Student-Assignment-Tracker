import { NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Home from './core/Home.jsx'
import AssignmentList from './components/assignment-list.jsx'
import AddAssignment from './components/add-assignment.jsx'

function Shell() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <NavLink to="/" className="brand" end>
            <span className="mark" aria-hidden="true">A</span>
            <span>Assignment Tracker</span>
          </NavLink>
          <nav className="nav" aria-label="Main">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/assignments" end>Assignments</NavLink>
            <NavLink to="/assignments/new">Add Assignment</NavLink>
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

const MainRouter = () => (
  <Routes>
    <Route element={<Shell />}>
      <Route index element={<Home />} />
      <Route path="assignments" element={<AssignmentList />} />
      <Route path="assignments/new" element={<AddAssignment />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
)

export default MainRouter
