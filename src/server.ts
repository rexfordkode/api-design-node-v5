import express from 'express'
import authRoutes from './routes/authRoutes.ts'
import habitRoutes from './routes/habitRoutes.ts'
import userRoutes from './routes/userRoutes.ts'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { isTest } from '../env.ts'

const app = express()

// Middleware
app.use(helmet())
app.use(cors())
app.use(
  morgan('dev', {
    skip: () => isTest(),
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (req, res) => {
  res
    .json({
      status: 'OK',
      service: 'Server is healthy',
      name: new Date().toISOString(),
    })
    .status(200)
})

app.post('/cake/:name/:id', (req, res) => {
  const { name, id } = req.params
  res
    .json({
      message: `You requested cake ${name} with id ${id}`,
      info: req.params,
    })
    .status(200)
})

app.use('/api/auth', authRoutes)
app.use('/api/habits', habitRoutes)
app.use('/api/users', userRoutes)

export { app }
export default app
