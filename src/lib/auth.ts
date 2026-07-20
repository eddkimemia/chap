import { NextRequest, NextResponse } from 'next/server'
import { db } from './db'

/** Single session cookie name — never store this token in localStorage. */
export const SESSION_COOKIE_NAME = 'session_token'

/** Absolute session lifetime (days). */
export const SESSION_EXPIRY_DAYS = 14

export const SESSION_MAX_AGE_SECONDS = SESSION_EXPIRY_DAYS * 24 * 60 * 60

const PBKDF2_ITERATIONS = 100000
const HASH_FORMAT = 'pbkdf2:100000:'

function toBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

function fromBase64(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

function toBase64Url(bytes: Uint8Array): string {
  return toBase64(bytes.buffer as ArrayBuffer)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return toBase64(salt.buffer)
}

async function deriveKey(
  password: string,
  salt: ArrayBuffer
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )

  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )
}

export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt()
  const key = await deriveKey(password, fromBase64(salt))
  const hash = toBase64(key)
  return `${HASH_FORMAT}${salt}:${hash}`
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const parts = storedHash.split(':')
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
    return false
  }
  const salt = fromBase64(parts[2])
  const key = await deriveKey(password, salt)
  const computedHash = toBase64(key)

  // Constant-time comparison
  if (computedHash.length !== parts[3].length) {
    return false
  }
  const a = new TextEncoder().encode(computedHash)
  const b = new TextEncoder().encode(parts[3])
  if (a.byteLength !== b.byteLength) return false
  let diff = 0
  for (let i = 0; i < a.byteLength; i++) {
    diff |= a[i] ^ b[i]
  }
  return diff === 0
}

/** Cryptographically strong session token (256-bit). */
export function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return toBase64Url(bytes)
}

export function generateOTP(): string {
  const otp = crypto.getRandomValues(new Uint32Array(1))[0]
  return String(otp % 1000000).padStart(6, '0')
}

export async function createSession(
  userId: string,
  ip?: string,
  ua?: string
): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS)

  await db.session.create({
    data: {
      userId,
      token,
      ipAddress: ip ?? null,
      userAgent: ua ?? null,
      expiresAt,
    },
  })

  return token
}

export function applySessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export function getSessionTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim()
    if (token) return token
  }

  return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null
}

export async function validateSession(token: string) {
  const session = await db.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          username: true,
          avatar: true,
          role: true,
          isVerified: true,
          isActive: true,
          isSuspended: true,
        },
      },
    },
  })

  if (!session) return null
  if (!session.isActive) return null
  if (new Date() > session.expiresAt) {
    await db.session.delete({ where: { id: session.id } })
    return null
  }
  if (session.user.isSuspended || !session.user.isActive) return null

  return session.user
}

export async function destroySession(token: string): Promise<boolean> {
  try {
    await db.session.delete({ where: { token } })
    return true
  } catch {
    return false
  }
}

/** Invalidate every session for a user (password change/reset, security events). */
export async function destroyAllUserSessions(userId: string): Promise<number> {
  const result = await db.session.deleteMany({ where: { userId } })
  return result.count
}

export async function getCurrentUser(request: NextRequest) {
  const token = getSessionTokenFromRequest(request)
  if (!token) return null
  return validateSession(token)
}

export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireAdmin(request: NextRequest) {
  const user = await requireAuth(request)
  if (user.role !== 'admin') {
    throw new Error('Forbidden')
  }
  return user
}
