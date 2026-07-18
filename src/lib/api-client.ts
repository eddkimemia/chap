/**
 * Browser fetch helper for authenticated API calls.
 * Relies on the HttpOnly `session_token` cookie — never attach tokens from localStorage.
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers)

  if (
    init.body != null &&
    !(init.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json')
  }

  // Never send a stale/empty Bearer header (would block cookie fallback).
  if (headers.get('Authorization')?.trim() === 'Bearer') {
    headers.delete('Authorization')
  }

  return fetch(input, {
    ...init,
    credentials: 'include',
    headers,
  })
}
