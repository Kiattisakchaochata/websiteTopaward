import jwt from 'jsonwebtoken'
import prisma from '../config/prisma.config.js'
import { createError } from '../utils/create-error.util.js'

// Middleware ตรวจสอบ JWT token
export const authenticate = async (req, res, next) => {
  console.log('✅ AUTH HIT');
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createError(401, 'ไม่ได้รับอนุญาต'))
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!user) return next(createError(401, 'ไม่พบผู้ใช้งาน'))

    req.user = user
    next()
  } catch (err) {
    next(createError(401, 'Token ไม่ถูกต้อง'))
  }
}