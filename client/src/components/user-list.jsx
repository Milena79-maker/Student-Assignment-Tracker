import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteMe, getUsers } from '../api.js'
import { useAuth } from '../auth.jsx'

export default function UserList() {
  const { user, signOut } = useAuth()
  const [users, setUsers] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [pending, setPending] = useState(null)

  useEffect(() => {
    document.title = 'Users · Assignment Tracker'
  }, [])

  useEffect(() => {
    let active = true
    getUsers()
      .then((data) => {
        if (active) setUsers(data)
      })
      .catch((err) => {
        if (!active) return
        setError(err.message)
        setUsers([])
      })
    return () => {
      active = false
    }
  }, [])

  async function confirmDelete() {
    setError('')
    try {
      await deleteMe()
      setPending(null)
      signOut()
      setUsers((current) => current.filter((item) => item._id !== user._id))
      setNotice('Account deleted.')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section>
      <p className="eyebrow">Classmates</p>
      <div className="section-head">
        <h1>Users</h1>
        {!user && <Link className="button" to="/sign-up">Sign up</Link>}
      </div>
      {notice && <p className="banner ok" role="status">{notice}</p>}
      {error && <p className="banner error" role="alert">{error}</p>}
      {users === null && !error && <p className="status-line">Loading users…</p>}
      {users && users.length === 0 && (
        <div className="empty">
          <p>No accounts yet.</p>
          <p><Link to="/sign-up">Create the first account</Link></p>
        </div>
      )}
      {users && users.length > 0 && (
        <div className="list">
          {users.map((account) => {
            const mine = user?._id === account._id
            return (
              <article key={account._id} className="card">
                <h2 className="title">{account.name}</h2>
                <p className="meta"><span>{account.email}</span></p>
                {mine && (
                  <div className="actions">
                    <Link className="button" to="/profile">Edit</Link>
                    <button type="button" className="button danger" onClick={() => setPending(account)}>
                      Delete
                    </button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
      {pending && (
        <div className="modal-backdrop" onClick={() => setPending(null)}>
          <div
            className="modal confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-account-title">Delete account</h2>
            <p>Delete your account? This cannot be undone.</p>
            <div className="form-actions">
              <button type="button" className="button danger solid" onClick={confirmDelete}>Delete</button>
              <button type="button" className="button secondary" onClick={() => setPending(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
