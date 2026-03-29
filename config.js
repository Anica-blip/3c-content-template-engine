// config.js — 3C Content Template Engine
// Supabase credentials for this project
// SUPABASE_SERVICE_ROLE_KEY is stored in Vercel environment variables (server-side only)

(() => {
  if (window.__APP_CONFIG_LOADED__) return;
  window.__APP_CONFIG_LOADED__ = true;

  window.APP_CONFIG = Object.freeze({
    SUPABASE_URL:     "https://uqyqpwhkzlhqxcqajhkn.supabase.co",
    SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeXFwd2hremxocXhjcWFqaGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NzY3MDMsImV4cCI6MjA2NjI1MjcwM30.AE-bdpBIATQCtNWvWo468ZWPwQ-9LWghRO6-BeAzA2U"
  });
})();
