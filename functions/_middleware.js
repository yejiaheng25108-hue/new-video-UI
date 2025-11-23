// Authentication middleware with custom login page
const USERNAME = 'yejiaheng';
const PASSWORD = 'yejiaheng25108';
const COOKIE_NAME = 'monster_auth';
const COOKIE_SECRET = 'monster_secret_key_12345';

async function signCookie(value) {
    const encoder = new TextEncoder();
    const data = encoder.encode(value + COOKIE_SECRET);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `${value}.${hashHex}`;
}

async function verifyCookie(signedValue) {
    if (!signedValue) return false;
    const parts = signedValue.split('.');
    if (parts.length !== 2) return false;
    const [value, hash] = parts;
    const expectedSigned = await signCookie(value);
    return expectedSigned === signedValue;
}

export async function onRequest(context) {
    const { request, next } = context;
    const url = new URL(request.url);
    const pathname = url.pathname;

    // CRITICAL: Allow login page and API without any checks
    // This prevents redirect loops
    if (pathname === '/login.html' ||
        pathname === '/login' ||
        pathname.startsWith('/api/')) {
        return next();
    }

    // Parse cookies
    const cookieHeader = request.headers.get('Cookie') || '';
    const cookies = Object.fromEntries(
        cookieHeader.split(';')
            .map(c => c.trim().split('='))
            .filter(([k]) => k)
    );

    const authCookie = cookies[COOKIE_NAME];

    // Verify authentication
    if (!authCookie || !(await verifyCookie(authCookie))) {
        // Not authenticated - redirect to login
        return Response.redirect(url.origin + '/login.html', 302);
    }

    // Authenticated - allow access
    return next();
}
