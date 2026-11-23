/**
 * 3C Content Template Engine — Sign out
 * Ends the Supabase sign-in (this browser only) and returns to the login page.
 * Built by Claude (Anthropic) × Chef Anica · 3C Thread To Success
 */

async function signOut() {
  try {
    // The shared logout from auth.js ends the Supabase session and goes to login.html
    if (window.authHelpers?.logout) {
      await window.authHelpers.logout();
      return;
    }
  } catch (error) {
    console.error('Sign out failed');
  }

  // Always end up on the login page, whatever happened above
  window.location.href = './login.html';
}
