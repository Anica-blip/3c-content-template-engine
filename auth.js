// auth.js — 3C Content Template Engine
// Client-side session guard — same pattern as 3C Control Center
// GitHub OAuth is handled server-side via /api/auth/login + /api/auth/callback

(() => {
  if (window.__AUTH_LOADED__) return;
  window.__AUTH_LOADED__ = true;

  const AUTHORIZED_USER = 'Anica-blip';
  const SESSION_KEY     = 'github-user';
  const EXPIRY_KEY      = 'session-expiry';

  const path        = location.pathname.toLowerCase();
  const isLoginPage = path.endsWith('/login.html');
  const isMainApp   = path === '/' || path.endsWith('/index.html');

  // ── Helpers ────────────────────────────────────────────────────────────────

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const user = JSON.parse(raw);
      if (user.login !== AUTHORIZED_USER) { clearSession(); return null; }
      return user;
    } catch {
      clearSession();
      return null;
    }
  }

  function isSessionValid() {
    const expiry = localStorage.getItem(EXPIRY_KEY);
    if (!expiry) return false;
    return new Date(expiry) > new Date();
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(EXPIRY_KEY);
  }

  function refreshExpiry() {
    localStorage.setItem(EXPIRY_KEY, new Date(Date.now() + 3600000).toISOString());
  }

  // ── Expose signOut globally for signout.js ─────────────────────────────────
  window.authHelpers = {
    logout: function() {
      clearSession();
      location.href = './login.html';
    }
  };

  // ── Consume OAuth callback ?session= param ─────────────────────────────────
  function consumeCallbackSession() {
    const params = new URLSearchParams(location.search);
    const raw    = params.get('session');
    const err    = params.get('auth_error') || params.get('error');

    if (err) {
      history.replaceState({}, '', location.pathname);
      if (isLoginPage) {
        const el = document.getElementById('error-message');
        if (el) {
          el.textContent = err === 'unauthorized'
            ? 'Access denied — authorised users only.'
            : 'Login failed. Please try again.';
          el.classList.add('show');
        }
      }
      return false;
    }

    if (raw) {
      try {
        const user = JSON.parse(decodeURIComponent(raw));
        if (user.login !== AUTHORIZED_USER) {
          clearSession();
          location.href = '/login.html?error=unauthorized';
          return false;
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        localStorage.setItem(EXPIRY_KEY, user.expiry);
        history.replaceState({}, '', location.pathname); // clean URL
        return true;
      } catch {
        clearSession();
        location.href = '/login.html?error=callback_failed';
        return false;
      }
    }

    return false;
  }

  // ── Route guard ────────────────────────────────────────────────────────────
  function guardRoutes() {
    const justSet    = consumeCallbackSession();
    const user       = getSession();
    const hasSession = !!user && (justSet || isSessionValid());

    if (hasSession) refreshExpiry();

    if (isLoginPage && hasSession) { location.href = './index.html'; return; }
    if (isMainApp && !hasSession)  { location.href = './login.html'; return; }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', guardRoutes);
  } else {
    guardRoutes();
  }

})();
