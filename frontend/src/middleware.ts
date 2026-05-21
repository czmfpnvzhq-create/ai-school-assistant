import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_super_secret_key");

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path === '/login' || path === '/register' || path === '/') {
    return NextResponse.next();
  }

  const token =
    request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    if (path.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (path.startsWith('/api/chat')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    if (path.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/chat'],
};
