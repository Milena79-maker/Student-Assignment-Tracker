import UserModel from '../models/user-model.js'
import generateToken from '../utils/jwt.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function publicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

function readAccount(body, { passwordRequired }) {
  const errors = []
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!name) errors.push('Name is required.')
  else if (name.length > 80) errors.push('Name must be 80 characters or fewer.')

  if (!email) errors.push('Email is required.')
  else if (!EMAIL.test(email)) errors.push('Enter a valid email.')

  if (passwordRequired && !password) errors.push('Password is required.')
  if (password && password.length < 6) errors.push('Password must be at least 6 characters.')

  return { errors, data: { name, email, password } }
}

export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().sort({ name: 1 })
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found.' })
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found.' })
    res.status(200).json(publicUser(user))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createUser = async (req, res) => {
  try {
    const { errors, data } = readAccount(req.body || {}, { passwordRequired: true })
    if (errors.length) return res.status(400).json({ message: errors[0] })

    const existing = await UserModel.findOne({ email: data.email })
    if (existing) return res.status(409).json({ message: 'That email is already registered.' })

    const user = await UserModel.create(data)
    res.status(201).json({ user: publicUser(user) })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'That email is already registered.' })
    }
    res.status(500).json({ message: error.message })
  }
}

async function saveAccount(user, data, { passwordOptional }) {
  user.name = data.name
  user.email = data.email
  if (data.password) user.password = data.password
  else if (!passwordOptional) {
    return { error: 'Password is required.' }
  }
  await user.save()
  return { user }
}

export const updateMe = async (req, res) => {
  try {
    const { errors, data } = readAccount(req.body || {}, { passwordRequired: false })
    if (errors.length) return res.status(400).json({ message: errors[0] })

    const user = await UserModel.findById(req.user.id).select('+password')
    if (!user) return res.status(404).json({ message: 'User not found.' })

    const taken = await UserModel.findOne({ email: data.email, _id: { $ne: user._id } })
    if (taken) return res.status(409).json({ message: 'That email is already registered.' })

    await saveAccount(user, data, { passwordOptional: true })
    res.status(200).json(publicUser(user))
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'That email is already registered.' })
    }
    res.status(500).json({ message: error.message })
  }
}

export const updateUser = async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ message: 'You can only update your own profile.' })
  }
  req.user.id = req.params.id
  return updateMe(req, res)
}

export const deleteMe = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found.' })
    res.status(200).json({ message: 'Account deleted.' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteUser = async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ message: 'You can only delete your own account.' })
  }
  return deleteMe(req, res)
}

export const loginUser = async (req, res) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const password = typeof req.body?.password === 'string' ? req.body.password : ''
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const user = await UserModel.findOne({ email }).select('+password')
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' })

    const isMatch = await user.comparePassword(password)
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password.' })

    res.status(200).json({
      message: 'Signed in.',
      token: generateToken(user),
      user: publicUser(user),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
