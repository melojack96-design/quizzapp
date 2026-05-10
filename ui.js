/**
 * ui.js — Toast notifications, loading overlays, and UI utilities
 */
"use strict";

/* ── Toast Notification System ─────────────────────────── */
const Toast = (() => {
  let container = null;

  function ensureContainer() {
    if (container) return container;
    container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }
    return container;
  }

  function show(message, type = "info", duration = 3500) {
    const wrap = ensureContainer();
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    const icons = { success: "\u2714", error: "\u2716", info: "\u24D8", warning: "\u26A0" };
    toast.innerHTML =
      `<span class="toast-icon">${icons[type] || icons.info}</span>` +
      `<span class="toast-msg">${message}</span>` +
      `<button class="toast-close">&times;</button>`;

    toast.querySelector(".toast-close").addEventListener("click", () => dismiss(toast));
    wrap.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));

    if (duration > 0) {
      setTimeout(() => dismiss(toast), duration);
    }
    return toast;
  }

  function dismiss(toast) {
    toast.classList.remove("show");
    toast.classList.add("hide");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
    setTimeout(() => toast.remove(), 400);
  }

  return {
    success: (msg, dur) => show(msg, "success", dur),
    error:   (msg, dur) => show(msg, "error", dur),
    info:    (msg, dur) => show(msg, "info", dur),
    warning: (msg, dur) => show(msg, "warning", dur),
  };
})();

/* ── Loading Overlay ──────────────────────────────────── */
const Loading = (() => {
  function show(targetId, message = "Loading...") {
    const target = document.getElementById(targetId);
    if (!target) return;
    let overlay = target.querySelector(".loading-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "loading-overlay";
      overlay.innerHTML =
        `<div class="loading-spinner"></div>` +
        `<p class="loading-text">${message}</p>`;
      target.style.position = target.style.position || "relative";
      target.appendChild(overlay);
    } else {
      overlay.querySelector(".loading-text").textContent = message;
    }
    overlay.classList.add("active");
  }

  function hide(targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;
    const overlay = target.querySelector(".loading-overlay");
    if (overlay) overlay.classList.remove("active");
  }

  return { show, hide };
})();

/* ── Route Guard ──────────────────────────────────────── */
const RouteGuard = (() => {
  function requireAuth() {
    if (!window._authUser) {
      const appScreen = document.getElementById("app-screen");
      const authScreen = document.getElementById("auth-screen");
      if (appScreen) appScreen.classList.add("hidden");
      if (authScreen) authScreen.classList.remove("hidden");
      Toast.warning("Please sign in to continue.");
      return false;
    }
    return true;
  }

  return { requireAuth };
})();

window.Toast = Toast;
window.Loading = Loading;
window.RouteGuard = RouteGuard;
