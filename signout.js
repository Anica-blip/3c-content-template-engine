/**
 * 3C Content Template Engine — Sign out
 * Built by Claude (Anthropic) × Chef Anica · 3C Thread To Success
 */

async function signOut() {
  try {
    // Prefer the shared logout helper from auth.js (already loaded)
    if (window.authHelpers?.logout) {
      window.authHelpers.logout();
      return;
    }

    // Fallback: clear localStorage directly
    localStorage.removeItem('github-user');
    localStorage.removeItem('session-expiry');
    window.location.href = './login.html';

  } catch (error) {
    console.error('Sign out failed:', error);
    // Always redirect to login regardless
    window.location.href = './login.html';
  }
}
