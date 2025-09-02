import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next()

  // Additional Security Headers (basic ones are handled by next.config.mjs)

  // Referrer Policy - Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // X-DNS-Prefetch-Control - Disable DNS prefetching
  response.headers.set('X-DNS-Prefetch-Control', 'off')

  // X-Permitted-Cross-Domain-Policies - Restrict cross-domain policies
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')

  // X-XSS-Protection - Enable XSS filtering (legacy but still useful)
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Cross-Origin-Embedder-Policy - Enhance security isolation
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')

  // Cross-Origin-Opener-Policy - Prevent cross-origin popups
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')

  // Cross-Origin-Resource-Policy - Control resource loading
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')

  return response
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

//export const config = {
  //matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - sw.js (service worker)
     * - workbox-*.js (workbox files)
     */
   // '/((?!_next/static|_next/image|favicon.ico|public|sw.js|workbox-).*)',],}
