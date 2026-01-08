import type { Response } from 'express'
import type { AuthenticateRequest } from '../middleware/auth.ts'
import { db } from '../db/connection.ts'
import { habits, entries, habitTags, type NewHabit } from '../db/schema.ts'
import { eq, and, desc, inArray } from 'drizzle-orm'

export const createHabit = async (req: AuthenticateRequest, res: Response) => {
  try {
    const { tagIds, title, description, frequency, targetCount, isActive } =
      req.body

    const result = await db.transaction(async (tx) => {
      const [newHabit] = await tx
        .insert(habits)
        .values({
          userId: req.user.id,
          title,
          description,
          frequency,
          targetCount,
          isActive,
        })
        .returning()

      if (tagIds && tagIds.length > 0) {
        const habitTagInserts = tagIds.map((tagId: number) => ({
          habitId: newHabit.id,
          tagId,
        }))
        await tx.insert(habitTags).values(habitTagInserts)
      }
      return newHabit
    })

    res
      .status(201)
      .json({ message: 'Habit created successfully', habit: result })
  } catch (error) {
    console.error('Error creating habit:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
export const getUserHabits = async (
  req: AuthenticateRequest,
  res: Response
) => {
  try {
    const userId = req.user.id
    console.log('REXFORD')
    const userHabits = await db.query.habits.findMany({
      where: eq(habits.userId, userId),
      with: {
        habitTags: {
          columns: {
            tagId: true,
          },
          where: inArray(habitTags.tagId, []),
        },
      },
      orderBy: [desc(habits.createdAt)],
    })

    res.status(200).json({ habits: userHabits })
  } catch (error) {
    console.error('Error fetching habits:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
export const updateHabit = async (req: AuthenticateRequest, res: Response) => {
  try {
    const { id } = req.params
    const { tagIds, ...updates } = req.body
    const userId = req.user.id
    console.log('Rexford here', updates, id, tagIds)
    const result = await db.transaction(async (tx) => {
      const [updatedHabit] = await tx
        .update(habits)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(and(eq(habits.id, id), eq(habits.userId, userId)))
        .returning()
      if (!updatedHabit) {
        return res.status(404).end()
      }
      if (tagIds !== undefined) {
        await tx.delete(habitTags).where(eq(habitTags.habitId, id))

        if (tagIds.length > 0) {
          const habitTagInserts = tagIds.map((tagId: number) => ({
            habitId: id,
            tagId,
          }))
          await tx.insert(habitTags).values(habitTagInserts)
        }
      }
      return updatedHabit
    })

    if (!result) {
      return res.status(404).end()
    }

    res
      .status(200)
      .json({ message: 'Habit updated successfully', habit: result })
  } catch (error) {
    console.error('Error updating habit:', error)
    res.status(500).json({ message: 'Failed to update habit' })
  }
}
export const getUserHabitById = async (
  req: AuthenticateRequest,
  res: Response
) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const habit = await db.query.habits.findFirst({
      where: and(eq(habits.id, id), eq(habits.userId, userId)),
    })

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' })
    }

    res.status(200).json({ habit })
  } catch (error) {
    console.error('Error fetching habit by ID:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
export const deleteHabit = async (req: AuthenticateRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const deletedHabit = await db
      .delete(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning()

    if (!deletedHabit) {
      return res.status(404).json({ message: 'Habit not found' })
    }

    res.status(200).json({ message: 'Habit deleted successfully' })
  } catch (error) {
    console.error('Error deleting habit:', error)
    res.status(500).json({ message: 'Failed to delete habit ' })
  }
}
export const completeHabit = async (
  req: AuthenticateRequest,
  res: Response
) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const habit = await db.query.habits.findFirst({
      where: and(eq(habits.id, id), eq(habits.userId, userId)),
    })

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' })
    }
    const [completedEntry] = await db
      .insert(entries)
      .values({ habitId: id, userId })
      .returning()

    res
      .status(201)
      .json({ message: 'Habit marked as complete', entry: completedEntry })
  } catch (error) {
    console.error('Error completing habit:', error)
    res.status(500).json({ message: 'Failed to complete habit' })
  }
}
export const getHabitEntries = async (
  req: AuthenticateRequest,
  res: Response
) => {
  try {
    const { id } = req.params // habit ID
    const userId = req.user.id

    const habitEntries = await db.query.entries.findMany({
      where: and(eq(entries.habitId, id), eq(entries.userId, userId)),
      orderBy: [desc(entries.createdAt)],
    })

    res.status(200).json({ entries: habitEntries })
  } catch (error) {
    console.error('Error fetching habit entries:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
export const getHabitsByTag = async (
  req: AuthenticateRequest,
  res: Response
) => {
  try {
    const { tagId } = req.params
    const userId = req.user.id

    const habitsByTag = await db
      .select()
      .from(habits)
      .innerJoin(habitTags, eq(habits.id, habitTags.habitId))
      .where(and(eq(habitTags.tagId, tagId), eq(habits.userId, userId)))

    res.status(200).json({ habits: habitsByTag })
  } catch (error) {
    console.error('Error fetching habits by tag:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
