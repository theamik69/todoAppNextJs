import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from './lib/jwt';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === '/login' || pathname === '/') {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;

  if (pathname.startsWith('/dashboard')) {
    const payload = token && verifyJwt(token);
    if (!payload) {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith('/api')) {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    const payload = token && verifyJwt(token);
    if (!payload) {
      return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*', '/api/:path*'],
};
