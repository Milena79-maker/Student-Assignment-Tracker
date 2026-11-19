import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signIn as signInRequest } from '../api.js'
import { useAuth } from '../auth.jsx'

export default function SignIn() {
  const { signIn, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(location.state?.notice || '')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    document.title = 'Sign In · Assignment Tracker'
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
    setBusy(true)
    try {
      const data = await signInRequest({
        email: values.email.trim(),
        password: values.password,
      })
      signIn(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel">
      <p className="eyebrow">Account</p>
      <h1>Sign in</h1>
      <p className="lede">Use the email and password from your account.</p>
      {notice && <p className="banner ok" role="status">{notice}</p>}
      <form className="form" onSubmit={handleSubmit}>
        {error && <p className="banner error" role="alert">{error}</p>}
        <div className="fields">
          <label className="field-wide">
            Email
            <input name="email" type="email" value={values.email} onChange={update} required autoComplete="email" />
          </label>
          <label className="field-wide">
            Password
            <input name="password" type="password" value={values.password} onChange={update} required autoComplete="current-password" />
          </label>
        </div>
        <div className="form-actions">
          <button className="button" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <Link className="button secondary" to="/sign-up">Create an account</Link>
        </div>
      </form>
    </section>
  )
}
