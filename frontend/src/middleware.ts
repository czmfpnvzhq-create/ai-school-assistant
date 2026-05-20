import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_super_secret_key");

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isAuthApi = path.startsWith('/api/auth/');
  const isDashboard = path.startsWith('/dashboard');

  if (isAuthApi || path === '/login' || path === '/register' || path === '/') {
    return NextResponse.next();
  }

  const protectedApiRoutes = [
    '/api/students', '/api/classes', '/api/attendance', 
    '/api/grades', '/api/teachers', '/api/chat', 
    '/api/notices', '/api/fees'
  ];

  const requiresAuth = isDashboard || protectedApiRoutes.some(route => path.startsWith(route));

  if (requiresAuth) {
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.split(' ')[1]; // Bearer <token>
    const cookieToken = request.cookies.get('token')?.value;
    
    // Use cookie token for browser navigation, fallback to Bearer for API clients
    const token = cookieToken || bearerToken;

    if (!token) {
      if (!token && isDashboard) {
        const res = NextResponse.redirect(new URL('/login', request.url));
        res.headers.set('X-Middleware-Missing', 'yes');
        return res;
      }
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    try {
      // Use jose for Edge-compatible JWT verification
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error: unknown) {
      console.error("Middleware JWT verification failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'unknown error';
      if (isDashboard) {
        const res = NextResponse.redirect(new URL('/login', request.url));
        res.headers.set('X-Middleware-Error', errorMessage);
        return res;
      }
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
