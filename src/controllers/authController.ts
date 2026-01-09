import type { Request, Response } from 'express'
import { db } from '../db/connection.ts'
import { users, type NewUser, type User } from '../db/schema.ts'
import { generateToken } from '../utils/jwt.ts'
import { comparePasswords, hashPassword } from '../utils/passwords.ts'
import { eq } from 'drizzle-orm'

export const register = async (
  req: Request<any, any, NewUser>,
  res: Response
) => {
  try {
    const hashedPassword = await hashPassword(req.body.password)

    const [user] = await db
      .insert(users)
      .values({
        ...req.body,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
      })

    const token = await generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    })

    return res.status(201).json({
      message: 'User created',
      user,
      token,
    })
  } catch (e) {
    console.error('Registration error', e)
    res.status(500).json({ error: 'Failed to create user' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isValidatedPassword = await comparePasswords(password, user.password)

    if (!isValidatedPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = await generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    })

    return res
      .json({
        message: 'Login success',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
        },
        token,
      })
      .status(201)
  } catch (e) {
    console.error('Loging error', e)
    res.status(500).json({ error: 'Failed to login' })
  }
}
