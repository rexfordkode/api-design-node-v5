import { SignJWT, jwtVerify, decodeJwt } from 'jose'
import { createSecretKey } from 'node:crypto'
import env from '../../env.ts'

export interface JwtPayload {
  id: string
  email: string
  username: string
  [key: string]: any
}

export const generateToken = async (payload: JwtPayload): Promise<string> => {
  const secret = env.JWT_SECRET
  const key = createSecretKey(Buffer.from(secret, 'utf-8'))

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN || '7d')
    .sign(key)

  return token
}

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  const secret = env.JWT_SECRET
  const key = createSecretKey(Buffer.from(secret, 'utf-8'))

  const { payload } = await jwtVerify(token, key)

  return payload as unknown as JwtPayload
}
