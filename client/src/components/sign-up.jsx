import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../api.js'
import { useAuth } from '../auth.jsx'

export default function SignUp() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    document.title = 'Sign Up · Assignment Tracker'
  }, [])

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  function update(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (values.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setBusy(true)
    try {
      await signUp({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      })
      navigate('/sign-in', { state: { notice: 'Account created. Sign in to continue.' } })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel">
      <p className="eyebrow">Account</p>
      <h1>Sign up</h1>
      <p className="lede">Create an account with your name, email, and a password.</p>
      <form className="form" onSubmit={handleSubmit}>
        {error && <p className="banner error" role="alert">{error}</p>}
        <div className="fields">
          <label className="field-wide">
            Name
            <input name="name" value={values.name} onChange={update} required maxLength={80} autoComplete="name" />
          </label>
          <label className="field-wide">
            Email
            <input name="email" type="email" value={values.email} onChange={update} required autoComplete="email" />
          </label>
          <label className="field-wide">
            Password
            <input name="password" type="password" value={values.password} onChange={update} required minLength={6} autoComplete="new-password" />
          </label>
        </div>
        <div className="form-actions">
          <button className="button" type="submit" disabled={busy}>
            {busy ? 'Creating account…' : 'Sign up'}
          </button>
          <Link className="button secondary" to="/sign-in">I already have an account</Link>
        </div>
      </form>
    </section>
  )
}
