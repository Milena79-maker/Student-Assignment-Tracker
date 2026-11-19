import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteMe, updateMe } from '../api.js'
import { useAuth } from '../auth.jsx'

export default function Profile() {
  const { user, ready, replaceUser, signOut } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    document.title = 'My Profile · Assignment Tracker'
  }, [])

  useEffect(() => {
    if (!user) return
    setValues({ name: user.name, email: user.email, password: '' })
  }, [user])

  if (!ready) return <p className="status-line">Loading profile…</p>
  if (!user) return null

  function update(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (values.password && values.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setBusy(true)
    try {
      const updated = await updateMe({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      })
      replaceUser(updated)
      setValues((current) => ({ ...current, password: '' }))
      setNotice('Profile updated.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function confirmDelete() {
    setError('')
    try {
      await deleteMe()
      signOut()
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
      setConfirming(false)
    }
  }

  return (
    <section className="panel">
      <p className="eyebrow">Account</p>
      <h1>My profile</h1>
      <p className="lede">Update your name, email, or password. Leave the password blank to keep the current one.</p>
      {notice && <p className="banner ok" role="status">{notice}</p>}
      <form className="form" onSubmit={handleSubmit}>
        {error && <p className="banner error" role="alert">{error}</p>}
        <div className="fields">
          <label className="field-wide">
            Name
            <input name="name" value={values.name} onChange={update} required maxLength={80} />
          </label>
          <label className="field-wide">
            Email
            <input name="email" type="email" value={values.email} onChange={update} required />
          </label>
          <label className="field-wide">
            New password
            <input name="password" type="password" value={values.password} onChange={update} autoComplete="new-password" />
          </label>
        </div>
        <div className="form-actions">
          <button className="button" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save changes'}
          </button>
          <button className="button danger" type="button" onClick={() => setConfirming(true)}>
            Delete account
          </button>
        </div>
      </form>
      {confirming && (
        <div className="modal-backdrop" onClick={() => setConfirming(false)}>
          <div
            className="modal confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-profile-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-profile-title">Delete account</h2>
            <p>Delete your account? This cannot be undone.</p>
            <div className="form-actions">
              <button type="button" className="button danger solid" onClick={confirmDelete}>Delete</button>
              <button type="button" className="button secondary" onClick={() => setConfirming(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
