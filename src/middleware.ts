import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionTokenFromRequest, validateSession } from '@/lib/auth'
import { isMaintenanceMode } from '@/lib/maintenance'

export const runtime = 'nodejs'

const publicPaths = [
  '/maintenance',
  '/login',
  '/register',
  '/forgot-password',
  '/2fa',
  '/verify-email',
  '/verify-phone',
  '/verify-identity',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-otp',
  '/api/auth/resend-code',
  '/api/auth/me',
  '/api/auth/logout',
  '/api/auth/2fa',
  '/api/auth/2fa/verify',
  '/api/listings',
  '/api/categories',
  '/api/locations',
  '/api/search',
  '/api/blog',
  '/api/faqs',
  '/api/reviews',
  '/api/plans',
  '/_next/static',
  '/_next/image',
  '/favicon.ico',
  '/icon-192.svg',
  '/icon-512.svg',
  '/icon-maskable.svg',
  '/logo.svg',
  '/chaplogo.png',
  '/logoicon.png',
  '/fav.png',
  '/manifest.json',
  '/robots.txt',
  '/uploads',
]

function isPublicPath(pathname: string): boolean {
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return true
  }
  if (pathname.startsWith('/listing/')) return true
  if (pathname.startsWith('/category/')) return true
  if (pathname.startsWith('/l/')) return true
  if (pathname.startsWith('/search')) return true
  if (pathname.startsWith('/blog/')) return true
  if (pathname.startsWith('/api/listings/')) return true
  if (pathname.startsWith('/api/categories/')) return true
  if (pathname.startsWith('/api/locations/')) return true
  if (pathname.startsWith('/api/blog/')) return true
  if (pathname.startsWith('/api/faqs/')) return true
  if (pathname.startsWith('/api/reviews/')) return true
  if (pathname.startsWith('/api/plans/')) return true
  return false
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Maintenance mode check
  if (await isMaintenanceMode()) {
    const allowedPaths = ['/login', '/register', '/forgot-password', '/2fa', '/verify-email', '/verify-phone', '/verify-identity', '/maintenance']
    const allowedApiPrefixes = ['/api/auth/', '/api/admin/']
    if (
      !allowedPaths.some((p) => pathname === p) &&
      !allowedApiPrefixes.some((p) => pathname.startsWith(p)) &&
      !pathname.startsWith('/_next/') &&
      pathname !== '/favicon.ico'
    ) {
      const token = getSessionTokenFromRequest(request)
      if (token) {
        const user = await validateSession(token)
        if (user?.role === 'admin') {
          // Admins can pass through
        } else {
          return NextResponse.redirect(new URL('/maintenance', request.url))
        }
      } else {
        return NextResponse.redirect(new URL('/maintenance', request.url))
      }
    }
  }

  if (isPublicPath(pathname)) {
    // Redirect authenticated users away from login/register to prevent flash
    if (pathname === '/login' || pathname === '/register') {
      const token = getSessionTokenFromRequest(request)
      if (token) {
        const user = await validateSession(token)
        if (user) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    const token = getSessionTokenFromRequest(request)
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    const user = await validateSession(token)
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    if (pathname.startsWith('/admin') && user.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    const response = NextResponse.next()
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon-192.svg|icon-512.svg|icon-maskable.svg|logo.svg|chaplogo.png|logoicon.png|fav.png|manifest.json|robots.txt|uploads).*)',
  ],
}
