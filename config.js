// config.js — 3C Content Template Engine
// Public settings only: the Supabase address and the PUBLIC (anon) key.
// The public key is meant to be visible in the browser. What it can read or change is decided
// by the database rules (owner-only), so no secret key belongs in this file or in the browser.
// Built by Claude (Anthropic) × Chef Anica · 3C Thread To Success Cooking Lab

(() => {
  if (window.__APP_CONFIG_LOADED__) return;
  window.__APP_CONFIG_LOADED__ = true;

  window.APP_CONFIG = Object.freeze({
    SUPABASE_URL: "https://uqyqpwhkzlhqxcqajhkn.supabase.co",
    SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeXFwd2hremxocXhjcWFqaGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NzY3MDMsImV4cCI6MjA2NjI1MjcwM30.AE-bdpBIATQCtNWvWo468ZWPwQ-9LWghRO6-BeAzA2U"
  });
})();
