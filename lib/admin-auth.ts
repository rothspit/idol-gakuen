import { NextRequest } from 'next/server'

/** /admin と同じ Basic 認証（API ルート用） */
export function verifyAdminBasicAuth(req: NextRequest): boolean {
  const basicAuth = req.headers.get('authorization')
  if (!basicAuth?.startsWith('Basic ')) return false

  try {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = Buffer.from(authValue, 'base64').toString('utf8').split(':')
    const validUser = process.env.BASIC_AUTH_USER || 'admin'
    const validPass = process.env.BASIC_AUTH_PASS || 'password'
    return user === validUser && pwd === validPass
  } catch {
    return false
  }
}

export function adminUnauthorizedResponse() {
  return new Response('Auth Required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
  })
}
