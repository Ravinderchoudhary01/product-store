import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh/validate the Supabase Auth session. Do not use getSession() here.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith('/admin');
  const isLoginRoute = path === '/admin/login' || path.startsWith('/admin/login/');

  if (!isAdminRoute) return response;

  // Allow the login page to load even when there is no session.
  if (isLoginRoute) {
    // If an authenticated admin visits /admin/login, send them to the dashboard.
    if (user && isAllowedAdmin(user.email)) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return response;
  }

  // Every protected admin route requires a Supabase Auth session.
  if (!user || !isAllowedAdmin(user.email)) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

function isAllowedAdmin(email?: string | null) {
  const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const currentEmail = email?.trim().toLowerCase();

  // Fail closed if ADMIN_EMAIL is missing.
  return Boolean(configuredAdminEmail && currentEmail && currentEmail === configuredAdminEmail);
}

export const config = {
  matcher: ['/admin/:path*'],
};
