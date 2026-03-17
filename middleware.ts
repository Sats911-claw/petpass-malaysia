import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Check for superadmin cookie (set by admin page after superadmin login)
  const isSuperadmin = request.cookies.get('petpass_superadmin')?.value === 'true'

  const protectedRoutes = ['/dashboard', '/pets', '/merchant', '/clinic', '/vet-finder', '/vets', '/vets/join']
  const isProtected = protectedRoutes.some(r => request.nextUrl.pathname.startsWith(r))

  // Allow access if logged in via Supabase OR is superadmin
  if (isProtected && !user && !isSuperadmin) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (request.nextUrl.pathname === '/login' && (user || isSuperadmin)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|scan|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
