import { Router } from 'express'
import { validateBody, validateParams } from '../middleware/validation.ts'
import { z } from 'zod'
import { authenticateToken } from '../middleware/auth.ts'
import {
  completeHabit,
  createHabit,
  deleteHabit,
  getHabitsByTag,
  getUserHabitById,
  getUserHabits,
  updateHabit,
} from '../controllers/habitController.ts'

const createHabitSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  frequency: z.string().optional(),
  targetCount: z.number().min(1, 'Target count must be at least 1').optional(),
  isActive: z.boolean().optional(),
  tagIds: z.array(z.string().uuid('Invalid tag ID')).optional(),
})
const updateHabitSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  frequency: z.string().optional(),
  targetCount: z.number().min(1, 'Target count must be at least 1').optional(),
  isActive: z.boolean().optional(),
  tagIds: z.array(z.string().uuid('Invalid tag ID')).optional(),
})
const uuidSchema = z.object({
  id: z.string().uuid('Invalid habit ID'),
})

const completeParamSchema = z.object({
  id: z.string().uuid('Invalid habit ID'),
})

const router = Router()
router.use(authenticateToken)
//CRUD routes for habits
router.get('/', getUserHabits)

router.get('/:id', validateParams(uuidSchema), getUserHabitById)

router.post('/', validateBody(createHabitSchema), createHabit)
router.patch(
  '/:id',
  validateParams(uuidSchema),
  validateBody(updateHabitSchema),
  updateHabit
)
router.delete('/:id', validateParams(uuidSchema), deleteHabit)

//Additional route to mark habit as complete
router.post(
  '/:id/complete',
  validateParams(uuidSchema),
  validateBody(z.object({ node: z.string().optional() })),
  completeHabit
)
router.get('/:id/entries', validateParams(uuidSchema))

router.get('/tag/:tagId', validateParams(uuidSchema), getHabitsByTag)

export default router
