// api/auth/callback.js
// Handles GitHub OAuth callback — same pattern as 3C Control Center

const AUTHORIZED_USER = 'Anica-blip';

export default async function handler(req, res) {
  const { code, error } = req.query;

  // GitHub denied access
  if (error || !code) {
    return res.redirect('/?auth_error=access_denied');
  }

  try {
    // Step 1 — Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept':       'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id:     process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      throw new Error('No access token returned from GitHub');
    }

    // Step 2 — Fetch GitHub user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept':        'application/vnd.github.v3+json'
      }
    });

    const user = await userRes.json();

    // Step 3 — Validate authorised user only
    if (user.login !== AUTHORIZED_USER) {
      console.warn(`Unauthorized login attempt: ${user.login}`);
      return res.redirect('/login.html?error=unauthorized');
    }

    // Step 4 — Build session payload and pass to client via URL param
    // Client-side auth.js will pick this up, store in localStorage, then clean the URL
    const sessionData = encodeURIComponent(JSON.stringify({
      login:      user.login,
      name:       user.name      || user.login,
      email:      user.email     || '',
      avatar_url: user.avatar_url || '',
      lastLogin:  new Date().toISOString(),
      expiry:     new Date(Date.now() + 3600000).toISOString() // 1 hour
    }));

    res.redirect(`/?session=${sessionData}`);

  } catch (err) {
    console.error('OAuth callback error:', err.message);
    res.redirect('/login.html?error=callback_failed');
  }
}
