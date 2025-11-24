// Login API endpoint
// 从环境变量中读取配置，提高安全性
const USERNAME = 'yejiaheng';
const COOKIE_NAME = 'monster_auth';

async function signCookie(value, secret) {
    const encoder = new TextEncoder();
    const data = encoder.encode(value + secret);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `${value}.${hashHex}`;
}

export async function onRequestPost(context) {
    const { request, env } = context;

    // 从环境变量中获取密钥和密码
    const PASSWORD = env.MY_SECRET_PASS;
    const COOKIE_SECRET = env.MY_SECRET_PASS;

    if (!PASSWORD) {
        return new Response(JSON.stringify({ success: false, error: 'Server configuration error' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    try {
        const body = await request.json();
        const { username, password } = body;

        if (username === USERNAME && password === PASSWORD) {
            // Create signed cookie
            const cookieValue = await signCookie('authenticated', COOKIE_SECRET);

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
