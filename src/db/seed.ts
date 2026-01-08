import { db } from './connection.ts'
import { users, habits, entries, tags, habitTags } from './schema.ts'
import bycrypt from 'bcrypt'

const seed = async () => {
  console.log('Starting database seed....')
  try {
    console.log('Clearing existing data...')
    await db.delete(entries)
    await db.delete(habitTags)
    await db.delete(tags)
    await db.delete(habits)
    await db.delete(users)

    console.log('Inserting demo users...')

    const [demoUser] = await db
      .insert(users)
      .values([
        {
          email: 'demo@app.com',
          username: 'demouser',
          password: await bycrypt.hash('password123', 12),
          firstName: 'Demo',
          lastName: 'User',
        },
        {
          email: 'john.doe@app.com',
          username: 'johndoe',
          password: await bycrypt.hash('password123', 12),
          firstName: 'John',
          lastName: 'Doe',
        },
      ])
      .returning()

    console.log('Creating tags...')
    const insertedTags = await db
      .insert(tags)
      .values([
        { name: 'Health', color: '#10B981' },
        { name: 'Productivity', color: '#3B82F6' },
        { name: 'Hobby', color: '#8B5CF6' },
      ])
      .returning()

    console.log('Creating habits...')
    const [habit1, habit2] = await db
      .insert(habits)
      .values([
        {
          userId: demoUser.id,
          title: 'Morning Jog',
          description: 'Jog for 30 minutes every morning',
          frequency: 'Daily',
          targetCount: 1,
        },
        {
          userId: demoUser.id,
          title: 'Read Books',
          description: 'Read for at least 20 minutes',
          frequency: 'Daily',
          targetCount: 1,
        },
      ])
      .returning()

    console.log('Linking tags to habits...')
    await db
      .insert(habitTags)
      .values([
        { habitId: habit1.id, tagId: insertedTags[0].id }, // Health
        { habitId: habit2.id, tagId: insertedTags[1].id }, // Productivity
      ])
      .execute()

    console.log('Adding completion entries...')
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Normalize to midnight

    for (let i = 1; i < 7; i++) {
      const entryDate = new Date(today)
      entryDate.setDate(entryDate.getDate() - i)
      await db
        .insert(entries)
        .values([
          {
            habitId: habit1.id,
            userId: demoUser.id,
            completionDate: entryDate,
            note: 'Felt great after the jog!',
          },
          {
            habitId: habit2.id,
            userId: demoUser.id,
            completionDate: entryDate,
            note: 'Finished reading a chapter.',
          },
        ])
        .execute()
    }
    console.log(' Database seed completed successfully.')
    console.log('User Credentials:')
    console.log(`Email: ${demoUser.email}`)
    console.log(`Username: ${demoUser.username}`)
    console.log(`Password: password123`)
  } catch (error) {
    console.error('Error during database seed:', error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch((e) => process.exit(1))
}

export default seed
