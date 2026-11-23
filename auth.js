// auth.js — 3C Content Template Engine
// Real sign-in through Supabase (GitHub), same method as the 3C Control Center.
// The database decides who the owner is (is_owner()); nothing here is a browser-only check.
// Needs, loaded BEFORE this file:  Supabase library (CDN)  +  config.js (public URL + public key).
// Built by Claude (Anthropic) × Chef Anica · 3C Thread To Success Cooking Lab

(() => {
  if (window.__AUTH_LOADED__) return;
  window.__AUTH_LOADED__ = true;

  const AUTHORIZED_USER = 'Anica-blip';
  const STORAGE_KEY     = 'sb-3c-template-engine-owner-login';
  const NOTICE_KEY      = '3c-template-engine-notice';

  const path        = location.pathname.toLowerCase();
  const isLoginPage = path.endsWith('/login.html');
  const isMainApp   = path === '/' || path.endsWith('/index.html');

  // ── Remove the old browser-only login flags so they can never grant access again ──
  try {
    localStorage.removeItem('github-user');
    localStorage.removeItem('session-expiry');
  } catch (e) { /* storage not available - nothing to remove */ }

  // ── Small helpers ──────────────────────────────────────────────────────────
  function setNotice(text) {
    try { sessionStorage.setItem(NOTICE_KEY, text); } catch (e) { /* ignore */ }
  }

  function takeNotice() {
    try {
      const text = sessionStorage.getItem(NOTICE_KEY);
      if (text) sessionStorage.removeItem(NOTICE_KEY);
      return text;
    } catch (e) {
      return null;
    }
  }

  function showError(text) {
    const el = document.getElementById('error-message');
    if (!el || !text) return;
    el.textContent = text;
    el.classList.add('show');
  }

  // ── Supabase client (one for the whole app) ────────────────────────────────
  const cfg = window.APP_CONFIG;
  if (!window.supabase || !cfg || !cfg.SUPABASE_URL || !cfg.SUPABASE_KEY) {
    console.error('Missing Supabase settings: the Supabase library and config.js must load before auth.js.');
    window.authReady = Promise.resolve(null);
    window.authHelpers = {
      signInWithGitHub: async () => { throw new Error('Supabase is not configured'); },
      logout: () => { location.href = './login.html'; }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => showError('Sign-in is not available right now.'));
    } else {
      showError('Sign-in is not available right now.');
    }
    return;
  }

  const client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_KEY, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: STORAGE_KEY
    }
  });
  window.sb = client;

  // ── Check the signed-in account: GitHub name AND the database owner check ──
  async function verifyOwner() {
    const { data: { session } } = await client.auth.getSession();
    if (!session) return null;

    const meta        = session.user.user_metadata || {};
    const githubLogin = meta.user_name || meta.preferred_username || '';

    const { data: isOwner, error: ownerError } = await client.rpc('is_owner');

    if (!ownerError && isOwner === true && githubLogin === AUTHORIZED_USER) {
      return {
        session,
        user: {
          login: githubLogin,
          name: meta.full_name || meta.name || githubLogin,
          email: session.user.email || '',
          avatar_url: meta.avatar_url || `https://github.com/${githubLogin}.png`
        }
      };
    }

    await client.auth.signOut({ scope: 'local' });
    setNotice('That account is not the owner account.');
    return null;
  }

  // Everything else waits for this: resolves to { session, user } for the owner, otherwise null.
  window.authReady = verifyOwner().catch(() => {
    console.error('Sign-in check failed');
    setNotice('Sign-in could not be checked. Please try again.');
    return null;
  });

  // ── Public helpers ─────────────────────────────────────────────────────────
  async function signInWithGitHub() {
    const { error } = await client.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${location.origin}/` }
    });
    if (error) throw error;
  }

  async function logout() {
    try {
      await client.auth.signOut({ scope: 'local' });
    } catch (e) {
      console.error('Sign out failed');
    }
    location.href = './login.html';
  }

  window.authHelpers = { signInWithGitHub, logout };

  // ── Route guard ────────────────────────────────────────────────────────────
  async function guardRoutes() {
    // GitHub or Supabase can send the sign-in back with an error in the address
    const urlError = new URLSearchParams(location.search).get('error_description');
    if (urlError) {
      setNotice('Sign-in was not completed. Please try again.');
      history.replaceState({}, document.title, location.pathname);
    }

    const auth = await window.authReady;

    if (isLoginPage) {
      const notice = takeNotice();
      if (notice) showError(notice);
      if (auth) location.replace('./index.html');
      return;
    }

    if (isMainApp && !auth) {
      location.replace('./login.html');
    }
  }

  // ── Login button (login.html) ──────────────────────────────────────────────
  function wireLoginButton() {
    const btn = document.getElementById('github-login');
    if (!btn) return;
    btn.addEventListener('click', async (event) => {
      event.preventDefault();
      btn.setAttribute('aria-busy', 'true');
      try {
        await signInWithGitHub();
      } catch (e) {
        btn.removeAttribute('aria-busy');
        showError('Sign-in could not be started. Please try again.');
      }
    });
  }

  // If the session ends (signed out in another tab, or it can no longer refresh)
  client.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT' && isMainApp) {
      location.replace('./login.html');
    }
  });

  function start() {
    wireLoginButton();
    guardRoutes();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

})();
