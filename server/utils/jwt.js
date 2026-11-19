import jwt from 'jsonwebtoken'

const generateToken = (user) => jwt.sign(
  { id: user._id.toString(), email: user.email, name: user.name },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)

export default generateToken
