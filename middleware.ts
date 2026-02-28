import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    if (
      req.nextUrl.pathname.startsWith('/dashboard') ||
      req.nextUrl.pathname.startsWith('/ticker') ||
      req.nextUrl.pathname.startsWith('/chat')
    ) {
      if (!req.nextauth.token) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    if (req.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = 
          req.nextUrl.pathname.startsWith('/login') ||
          req.nextUrl.pathname.startsWith('/auth/signup');

        if (isAuthPage) {
          return true;
        }

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
