import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Exclude static paths and API routes explicitly to avoid unnecessary checks/loops
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') || 
    pathname.includes('.') || // Files with extensions (images, etc)
    pathname.startsWith('/api') || // Don't block API requests
    pathname.startsWith('/docs') // Documentation
  ) {
    return NextResponse.next()
  }

  try {
    // Check setup status from backend
    // Use internal docker DNS 'backend' service name
    // This fetch runs on the server side (Node.js/Edge) within the container
    const res = await fetch('http://backend:8000/api/core/setup/status/', {
      next: { revalidate: 0 }, // Ensure we don't cache the result
      method: 'GET',
    })

    if (res.ok) {
      const data = await res.json()
      
      // If setup is NOT completed
      // data.is_completed will be present if the endpoint is working correctly
      if (!data.is_completed) {
        // Allow access to /setup
        if (pathname.startsWith('/setup')) {
            return NextResponse.next()
        }
        // Redirect everything else to /setup
        // This is the "hard redirect" requested
        return NextResponse.redirect(new URL('/setup', request.url))
      }
      
      // If setup IS completed
      if (data.is_completed) {
         // If trying to access /setup, redirect to dashboard or home to prevent duplicate setup
         if (pathname.startsWith('/setup')) {
             return NextResponse.redirect(new URL('/dashboard', request.url))
         }
      }
    }
  } catch (error) {
    // If backend is unreachable (e.g. during startup), fail open to allow the app to attempt rendering
    // This prevents the entire frontend from crashing if the backend is momentarily modifying
    console.error("Middleware backend check failed:", error)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
