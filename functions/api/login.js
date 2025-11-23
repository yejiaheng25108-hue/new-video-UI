// Login API endpoint
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

export async function onRequestPost(context) {
    const { request } = context;

    try {
        const body = await request.json();
        const { username, password } = body;

        if (username === USERNAME && password === PASSWORD) {
            // Create signed cookie
            const cookieValue = await signCookie('authenticated');

            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': `${COOKIE_NAME}=${cookieValue}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
                }
            });
        } else {
            return new Response(JSON.stringify({ success: false, error: 'Invalid credentials' }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid request' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
