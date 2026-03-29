// api/auth/login.js
// Redirects user to GitHub OAuth authorization page

export default function handler(req, res) {
  const params = new URLSearchParams({
    client_id:    process.env.GITHUB_CLIENT_ID,
    redirect_uri: 'https://3c-content-template-engine.vercel.app/api/auth/callback',
    scope:        'read:user user:email'
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
