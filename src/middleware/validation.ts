import type { Request, Response, NextFunction } from 'express'
import { ZodError, type ZodSchema } from 'zod'
import { env } from '../../env.ts'

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validateData = schema.parse(req.body)
      req.body = validateData

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        next(error)
        return res.status(400).json({
          errors: 'Validation failed',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
          stage: env.APP_STAGE,
        })
      }
      next(error)
    }
  }
}
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validateData = schema.parse(req.params)
      req.params = validateData as Record<string, string>
      //   schema.parse(req.params)

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          errors: 'Invalid parameters',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
          stage: env.APP_STAGE,
        })
      }
      next(error)
    }
  }
}
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validateData = schema.parse(req.query)
      req.query = validateData as Record<string, string>
      //   schema.parse(req.params)

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          errors: 'Invalid query parameters',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
          stage: env.APP_STAGE,
        })
      }
      next(error)
    }
  }
}
