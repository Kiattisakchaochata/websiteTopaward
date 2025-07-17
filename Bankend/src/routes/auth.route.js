import express from 'express'
import { register, login, getMe } from '../controllers/auth.controller.js'
import { validate } from '../middlewares/validator.middleware.js'
import { registerSchema, loginSchema } from '../validations/auth.validation.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Register
router.post('/register', validate(registerSchema), register)

// Login
router.post('/login', validate(loginSchema), login)

// Get current user info
router.get('/me', authenticate, getMe)

export default router