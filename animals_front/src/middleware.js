import { NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function middleware(req) {
  console.log('Middleware triggered for:', req.nextUrl.pathname);

  const tokenObj = req.cookies.get('access_token'); // Get token object
  const token = tokenObj ? tokenObj.value : null; // Extract the token value
  console.log('Extracted Token:', token);

  if (!token) {
    console.log('No token found, redirecting to login.');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const decoded = jwtDecode(token);
    console.log('Decoded token:', decoded);

    // Get the requested path
    const path = req.nextUrl.pathname;

    // If the user is a Proprietaire and tries to access /admin
    if (decoded.role === 'Proprietaire' && path.startsWith('/admin')) {
      console.log('Proprietaire user tried to access /admin. Redirecting to /home.');
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Allow access if no issues
    console.log('Access granted to:', path);
    return NextResponse.next();
  } catch (error) {
    console.log('Error decoding token:', error);
    NextResponse.cookies.set('access_token', '', { expires: new Date(0) });

    return NextResponse.redirect(new URL('/login', req.url));
    
  }
}

// Define the paths where this middleware will run
export const config = {
  matcher: ['/admin/:path*', '/home', ],
};

