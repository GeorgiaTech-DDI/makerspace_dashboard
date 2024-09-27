export async function auth3DPOS() {
    const loginUrl = "https://cloud.3dprinteros.com/apiglobal/login";
    let username = process.env.USER_3DOS;
    let password = process.env.PASS_3DOS;

    if (!username || !password) {
        throw new Error("Username or password is not defined in environment variables");
    }

    password = password.replace(/\\([%$!])/g, '$1'); // Unescape special characters, this is so dumb I hate nextJS

    const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'username': username,
            'password': password,
        })
    });

    const data = await response.json();
    console.log('data:', data);

    if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
    }

    return data.message.session;
}

export async function checkSession3DPOS(session: string) {
    const checkSessionUrl = "https://cloud.3dprinteros.com/apiglobal/check_session";
    const response = await fetch(checkSessionUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'session': session,
        })
    });
    const data = await response.json();
    return data.result;
}

export async function authSUMS() {
    const egKey = process.env.EG_KEY;
    const egId = process.env.EG_ID;
    
    if (!egKey || !egId) {
        throw new Error("EG Key or EG ID is not defined in environment variables");
    }
    // not really auth but whatever, keep the processes the same for learning
    return `${egKey}:${egId}`;
}