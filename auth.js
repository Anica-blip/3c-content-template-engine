// auth.js — 3C Content Template Engine
// GitHub OAuth via Supabase — same pattern as 3c-card-games

(() => {
  if (window.__AUTH_LOADED__) return;
  window.__AUTH_LOADED__ = true;

  const errorEl   = document.getElementById("error-message");
  const successEl = document.getElementById("success-message");

  function showError(message) {
    if (successEl) successEl.classList.remove("show");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("show");
    } else {
      alert(message);
    }
  }

  function showSuccess(message) {
    if (errorEl) errorEl.classList.remove("show");
    if (successEl) {
      successEl.textContent = message;
      successEl.classList.add("show");
    }
  }

  if (!window.supabase?.createClient) {
    showError("Supabase library failed to load.");
    return;
  }

  if (!window.APP_CONFIG?.SUPABASE_URL || !window.APP_CONFIG?.SUPABASE_ANON_KEY) {
    showError("Missing Supabase config.");
    return;
  }

  const sb =
    window.sb ||
    window.supabase.createClient(
      window.APP_CONFIG.SUPABASE_URL,
      window.APP_CONFIG.SUPABASE_ANON_KEY
    );
  window.sb = sb;

  const path        = location.pathname.toLowerCase();
  const isLoginPage = path.endsWith("/login.html");
  const isMainApp   = path === "/" || path.endsWith("/index.html");

  async function signInWithGitHub() {
    showSuccess("Redirecting to GitHub...");
    const { error } = await sb.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: "https://3c-content-template-engine.vercel.app/"
      }
    });
    if (error) showError(`GitHub login failed: ${error.message}`);
  }

  async function signOut() {
    const { error } = await sb.auth.signOut();
    if (error) {
      showError(`Logout failed: ${error.message}`);
      return;
    }
    location.href = "./login.html";
  }

  // Expose signOut globally so signout.js button can call it
  window.authHelpers = { logout: signOut };

  async function guardRoutes() {
    const { data, error } = await sb.auth.getSession();
    if (error) {
      showError(`Session check failed: ${error.message}`);
      return;
    }

    const hasSession = !!data?.session;

    // On login page with active session → go to app
    if (isLoginPage && hasSession) {
      location.href = "./index.html";
      return;
    }

    // On main app without session → go to login
    if (isMainApp && !hasSession) {
      location.href = "./login.html";
      return;
    }
  }

  function wireButtons() {
    const loginBtn = document.getElementById("github-login-btn");
    if (loginBtn) {
      loginBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await signInWithGitHub();
      });
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", async () => {
      await guardRoutes();
      wireButtons();
    });
  } else {
    guardRoutes().then(wireButtons);
  }

})();
