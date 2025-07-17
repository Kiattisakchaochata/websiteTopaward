import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/prisma.config.js'
import { createError } from '../utils/create-error.util.js'



export const register = async (req, res, next) => {
  try {
    const {name, email, password} = req.body
    const existing = await prisma.user.findUnique({where: {email}})
    if(existing) return next (createError (400, 'อีเมลนี้ถูกใช้งานแล้ว'))

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data:{
        name,
        email,
        password_hash: hashed,
        role: 'USER'
      }
    })

    res.status(201).json({message: 'สมัครสมาชิกสำเร็จ', user: {id: user.id, name: user.name, email:user.email}})
  } catch (err) {
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password_hash: true,
        role: true
      }
    })

    if (!user) return next(createError(400, 'อีเมลไม่ถูกต้อง'))

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) return next(createError(400, 'รหัสผ่านไม่ถูกต้อง'))

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    })

    res.status(200).json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (err) {
    next(err)
  }
}

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: {id: req.user.id},
      select: {id: true, name: true, email: true, role: true}
    })
    res.json(user)
  } catch (err) {
    next(err)
  }
}


