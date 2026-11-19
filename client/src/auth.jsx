import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getMe } from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!token) {
      setUser(null)
      setReady(true)
      return undefined
    }

    let active = true
    getMe()
      .then((data) => {
        if (active) setUser(data)
      })
      .catch(() => {
        localStorage.removeItem('token')
        if (!active) return
        setToken('')
        setUser(null)
      })
      .finally(() => {
        if (active) setReady(true)
      })

    return () => {
      active = false
    }
  }, [token])

  const value = useMemo(() => ({
    token,
    user,
    ready,
    signIn(nextToken, nextUser) {
      localStorage.setItem('token', nextToken)
      setToken(nextToken)
      setUser(nextUser)
      setReady(true)
    },
    replaceUser(nextUser) {
      setUser(nextUser)
    },
    signOut() {
      localStorage.removeItem('token')
      setToken('')
      setUser(null)
    },
  }), [token, user, ready])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
