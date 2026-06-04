import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ═══════════════════════════════════════════
// NUCLEAR CACHE CLEAR — runs before React mounts
// ═══════════════════════════════════════════
const BUILD_VERSION = '2026-06-04-v4.0-adventure-wipe';
const storedVersion = localStorage.getItem('sls_app_version');

async function nuclearClear() {
  // Clear all storage
  localStorage.clear();
  sessionStorage.clear();
  // Clear IndexedDB
  try {
    const dbs = await window.indexedDB?.databases?.();
    if (dbs) dbs.forEach(db => window.indexedDB.deleteDatabase(db.name));
  } catch (e) {}
  // Clear Cache API
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
  } catch (e) {}
  // Unregister service workers
  try {
    const regs = await navigator.serviceWorker?.getRegistrations?.();
    if (regs) regs.forEach(r => r.unregister());
  } catch (e) {}
  // Set new version and reload hard
  localStorage.setItem('sls_app_version', BUILD_VERSION);
  const url = new URL(location.href);
  url.searchParams.set('_v', BUILD_VERSION);
  url.searchParams.set('_t', Date.now());
  location.replace(url.toString());
}

if (storedVersion && storedVersion !== BUILD_VERSION) {
  nuclearClear();
} else {
  localStorage.setItem('sls_app_version', BUILD_VERSION);
}

// ═══════════════════════════════════════════
// GLOBAL ERROR HANDLER — catch React crashes
// ═══════════════════════════════════════════
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled rejection:', e.reason);
});

// ═══════════════════════════════════════════
// MOUNT REACT
// ═══════════════════════════════════════════
const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  document.body.innerHTML = '<div style="color:#0ff;font-family:sans-serif;padding:20px;">Root element not found.</div>';
}
