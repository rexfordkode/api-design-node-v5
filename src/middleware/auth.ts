import type { Request, Response, NextFunction } from 'express'
import { verifyToken, type JwtPayload } from '../utils/jwt.ts'
import { env } from '../../env.ts'

export interface AuthenticateRequest extends Request {
  user?: JwtPayload
}

export const authenticateToken = async (
  req: AuthenticateRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Bad Request' })
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyToken(token)
    req.user = payload
    next()
  } catch (error) {
    console.error('Error authenticating token:', error)
    res.status(403).json({ message: 'Forbidden' })
  }
}
