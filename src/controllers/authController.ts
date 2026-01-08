import type { Request, Response } from 'express'
import bycrypt from 'bcrypt'
import { db } from '../db/connection.ts'
import { users, type NewUser } from '../db/schema.ts'
import { comparePasswords, hashPassword } from '../utils/passwords.ts'
import { generateToken } from '../utils/jwt.ts'
import { eq } from 'drizzle-orm'

export const register = async (
  req: Request<any, any, NewUser>,
  res: Response
) => {
  const { password } = req.body

  try {
    const hashedPassword = await hashPassword(password)

    const [newUser] = await db
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
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
    })
    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      token,
    })
  } catch (error) {
    console.error('Error registering user:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    const isPasswordValid = await comparePasswords(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = await generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    })
    const { id, username, createdAt, firstName, lastName } = user
    res.status(201).json({
      message: 'User logged in successfully',
      user: {
        id: id,
        email: email,
        username: username,
        firstName: firstName,
        lastName: lastName,
        createdAt: createdAt,
      },
      token,
    })
  } catch (error) {
    console.error('Error logging in user:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
