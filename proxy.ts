import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NextRequest} from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  // Check if locale is in pathname
  const localeInPath = routing.locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  console.log('🔍 MW DEBUG:', {
    pathname,
    localeInPath,
    locales: routing.locales,
    default: routing.defaultLocale,
  });

  const response = intlMiddleware(request);

  console.log('📤 MW RESPONSE:', {
    status: response.status,
    location: response.headers.get('location'),
  });

  return response;
}

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
