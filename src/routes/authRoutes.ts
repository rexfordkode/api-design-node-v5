import { Router } from 'express'
import { login, register } from '../controllers/authController.ts'
import { validateBody } from '../middleware/validation.ts'
import { z } from 'zod'
import { UserInsertSchema } from '../db/schema.ts'

const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
})
const router = Router()

router.post('/register', validateBody(UserInsertSchema), register)

router.post('/login', validateBody(loginSchema), login)

export default router
