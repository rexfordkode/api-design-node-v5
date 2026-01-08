import type { Response } from 'express'
import type { AuthenticateRequest } from '../middleware/auth.ts'
import { db } from '../db/connection.ts'
import {
  habits,
  entries,
  habitTags,
  type NewHabit,
  users,
} from '../db/schema.ts'
import { eq, and, desc, inArray } from 'drizzle-orm'
import { comparePasswords, hashPassword } from '../utils/passwords.ts'

export const getProfile = async (req: AuthenticateRequest, res: Response) => {
  try {
    const userId = req.user.id

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({ user })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const updateProfile = async (
  req: AuthenticateRequest,
  res: Response
) => {
  try {
    const userId = req.user.id
    const { email, username, firstName, lastName } = req.body

    await db
      .update(users)
      .set({ email, username, firstName, lastName })
      .where(eq(users.id, userId))

    res.status(200).json({ message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Error updating user profile:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const deleteProfile = async (
  req: AuthenticateRequest,
  res: Response
) => {
  try {
    const userId = req.user.id

    await db.delete(users).where(eq(users.id, userId))

    res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user profile:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
export const changePassword = async (
  req: AuthenticateRequest,
  res: Response
) => {
  try {
    const userId = req.user.id
    const { newPassword, currentPassword } = req.body
    const hashedPassword = await hashPassword(newPassword)

    //Get Current Password
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    //Verify Current Password
    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.password
    )
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }
    //Update Password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId))

    res.status(200).json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Error changing password:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
