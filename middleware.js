import { NextResponse } from 'next/server';

export function middleware(request) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}