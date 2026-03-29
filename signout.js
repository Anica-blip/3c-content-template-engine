/**
 * 3C Content Template Engine — Sign out functionality
 * Built by Claude (Anthropic) × Chef Anica · 3C Thread To Success
 */

async function signOut() {
  try {
    // Prefer shared logout helper from auth.js
    if (window.authHelpers?.logout) {
      await window.authHelpers.logout();
      return;
    }

    // Fallback: direct sign-out if helper is unavailable
    const client = window.supabase.createClient(
      window.APP_CONFIG.SUPABASE_URL,
      window.APP_CONFIG.SUPABASE_ANON_KEY
    );
    const { error } = await client.auth.signOut();
    if (error) throw error;

    window.location.href = "./login.html";
  } catch (error) {
    console.error("Sign out failed:", error);
    // Always send user back to login page
    window.location.href = "./login.html";
  }
}
