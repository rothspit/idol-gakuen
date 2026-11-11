import { NextRequest, NextResponse } from 'next/server'

// ============================================
// matcher: 全パスにマッチ（静的ファイル除外）
// ============================================
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|eot)$).*)',
  ],
}

// ============================================
// ブランドマップ
// ============================================
type BrandEntry = { slug: string; style: string }

const BRAND_MAP: Record<string, BrandEntry> = {
  'idolgakuen.jp':       { slug: 'idol-gakuen', style: 'pop' },
  'www.idolgakuen.jp':   { slug: 'idol-gakuen', style: 'pop' },
}

const DEFAULT_BRAND: BrandEntry = { slug: 'idol-gakuen', style: 'pop' }

// ============================================
// ブランド判定
// ============================================
function getHostname(req: NextRequest): string {
  return req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? ''
}

function resolveBrand(req: NextRequest): BrandEntry {
  const brandParam = req.nextUrl.searchParams.get('brand')
  if (brandParam) {
    const entry = Object.values(BRAND_MAP).find((b) => b.slug === brandParam)
    if (entry) return entry
  }

  const host = getHostname(req)
  return BRAND_MAP[host] ?? DEFAULT_BRAND
}

// ============================================
// /admin/* Basic認証
// ============================================
function handleAdminAuth(req: NextRequest): NextResponse | null {
  const basicAuth = req.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    const validUser = process.env.BASIC_AUTH_USER || 'admin'
    const validPass = process.env.BASIC_AUTH_PASS || 'password'

    if (user === validUser && pwd === validPass) {
      return null
    }
  }

  return new NextResponse('Auth Required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin Area"',
    },
  })
}

// ============================================
// リライト不要パスの判定
// ============================================
const PASSTHROUGH_PREFIXES = ['/admin', '/tiara', '/api', '/login']

function isPassthroughPath(pathname: string): boolean {
  return PASSTHROUGH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

// ============================================
// ドメインベースURLリライト
// ============================================
function resolveRewrite(
  req: NextRequest,
  brand: BrandEntry,
): URL | null {
  const { pathname } = req.nextUrl
  const host = getHostname(req)
  const isPortal = host.startsWith('localhost') && !BRAND_MAP[host]

  if (isPortal) return null

  // idol-gakuen ドメイン
  if (brand.slug === 'idol-gakuen') {
    if (pathname === '/') {
      return new URL('/funabashi', req.url)
    }
    if (pathname === '/funabashi/home') {
      return new URL('/funabashi', req.url)
    }
    return null
  }

  return null
}

// ============================================
// メイン
// ============================================
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // --- /admin/* → Basic認証 ---
  if (pathname.startsWith('/admin')) {
    const authResponse = handleAdminAuth(req)
    if (authResponse) return authResponse
  }

  // --- ブランド判定 ---
  const brand = resolveBrand(req)
  const hostname = getHostname(req)
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-brand-slug', brand.slug)
  requestHeaders.set('x-brand-style', brand.style)

  const debugHeaders = {
    'x-debug-hostname': hostname,
    'x-debug-brand': brand.slug,
    'x-debug-host-raw': req.headers.get('host') ?? '',
    'x-debug-x-forwarded-host': req.headers.get('x-forwarded-host') ?? '',
  }

  // --- パススルー（リライト不要パス） ---
  if (isPassthroughPath(pathname)) {
    const res = NextResponse.next({ request: { headers: requestHeaders } })
    Object.entries(debugHeaders).forEach(([k, v]) => res.headers.set(k, v))
    return res
  }

  // --- URLリライト判定 ---
  const rewriteUrl = resolveRewrite(req, brand)

  if (rewriteUrl) {
    const res = NextResponse.redirect(rewriteUrl, 308)
    Object.entries(debugHeaders).forEach(([k, v]) => res.headers.set(k, v))
    return res
  }

  // --- デフォルト: そのまま通す ---
  const res = NextResponse.next({ request: { headers: requestHeaders } })
  Object.entries(debugHeaders).forEach(([k, v]) => res.headers.set(k, v))
  return res
}
