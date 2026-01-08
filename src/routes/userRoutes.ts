import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.ts'
import { z } from 'zod'
import {
  changePassword,
  getProfile,
  updateProfile,
} from '../controllers/userController.ts'
import { validateBody } from '../middleware/validation.ts'

const router = Router()

//Apply authentication middleware to all user routes
router.use(authenticateToken)

//Validation schema
const updateProfileSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(50, 'Username must be at most 50 characters long')
    .optional(),
  firstName: z
    .string()
    .max(100, 'First name must be at most 100 characters long')
    .optional(),
  lastName: z
    .string()
    .max(100, 'Last name must be at most 100 characters long')
    .optional(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long')
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
      'New password must contain uppercase, lowercase, and number'
    ),
})

router.get('/profile', getProfile)

router.get('/:id', (req, res) => {
  const { id } = req.params
  res.json({ message: `Details of user ${id}` }).status(200)
})

router.delete('/:id', (req, res) => {
  const { id } = req.params
  res.json({ message: `User ${id} deleted` }).status(200)
})
router.put('/profile', validateBody(updateProfileSchema), updateProfile)
router.post(
  '/change-password',
  validateBody(changePasswordSchema),
  changePassword
)

export default router
