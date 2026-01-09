import request from 'supertest'
import app from '../src/server.ts'

import {
  cleanupDatabase,
  createTestHabit,
  createTestUser,
} from './setup/dbHelpers.ts'

describe('Authentication Tests', () => {
  afterEach(async () => {
    // Clean up any te`st data
    await cleanupDatabase()
  })

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const userDate = {
        email: 'testmail@example.com',
        username: 'testuser',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
      }
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...userDate })
        .expect(201)

      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('user.id')
      expect(response.body).toHaveProperty('user.email', userDate.email)
      expect(response.body).toHaveProperty('user.username', userDate.username)
    })
  })
  describe('POST /auth/login', () => {
    it('should login an existing user', async () => {
      const { user } = await createTestUser({
        email: 'testuser@example.com',
        username: 'testuser',
        password: 'TestPassword123!',
      })
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'TestPassword123!',
        })
        .expect(200)
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('user.id')
      expect(response.body).toHaveProperty('user.email', user.email)
      expect(response.body).toHaveProperty('user.username', user.username)
    })
  })
})
