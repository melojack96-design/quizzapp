/**
 * auth.js
 * Handles: Splash -> Auth -> App flow
 * Features: Email/Password, Google, Facebook, Remember Me,
 *           Forgot Password, Offline mode, User Profile, Route Guard
 */
"use strict";

/* ── Helpers ─────────────────────────────────────────── */
function $(id) { return document.getElementById(id); }
function showEl(id) { $(id).classList.remove("hidden"); }
function hideEl(id) { $(id).classList.add("hidden"); }

function setError(id, msg) {
  const el = $(id);
  el.textContent = msg;
  el.classList.toggle("hidden", !msg);
}

function setBusy(btnId, busy) {
  const btn = $(btnId);
  if (!btn) return;
  btn.disabled = busy;
  const label = btn.querySelector(".btn-label");
  const spinner = btn.querySelector(".btn-spinner");
  if (label) label.style.opacity = busy ? "0.5" : "1";
  if (spinner) spinner.classList.toggle("hidden", !busy);
}

/* ── Splash Screen ───────────────────────────────────── */
function runSplash() {
  const fill = $("splash-fill");
  const text = $("splash-text");
  const steps = [
    { pct: 30,  msg: "Loading assets\u2026" },
    { pct: 60,  msg: "Connecting\u2026" },
    { pct: 85,  msg: "Almost ready\u2026" },
    { pct: 100, msg: "Let's go!" },
  ];
  let i = 0;
  function next() {
    if (i >= steps.length) return;
    const s = steps[i++];
    fill.style.width = s.pct + "%";
    text.textContent = s.msg;
    if (i < steps.length) setTimeout(next, 600);
  }
  next();
  return new Promise(resolve => setTimeout(resolve, 2800));
}

/* ── Online / Offline indicator ──────────────────────── */
function updateConnUI(online) {
  const dot = $("conn-dot");
  const label = $("conn-label");
  const banner = $("offline-banner");
  if (!dot) return;
  if (online) {
    dot.className = "conn-dot online";
    label.textContent = "Online";
    if (banner) banner.classList.add("hidden");
  } else {
    dot.className = "conn-dot offline";
    label.textContent = "Offline";
    if (banner) banner.classList.remove("hidden");
  }
}

window.addEventListener("online", () => updateConnUI(true));
window.addEventListener("offline", () => updateConnUI(false));

/* ── Auth-screen tabs ────────────────────────────────── */
function initTabs() {
  document.querySelectorAll(".auth-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".auth-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".auth-form").forEach(f => f.classList.remove("active"));
      tab.classList.add("active");
      $("form-" + tab.dataset.tab).classList.add("active");
      setError("login-error", "");
      setError("reg-error", "");
    });
  });
}

/* ── Password visibility toggles ─────────────────────── */
function initPwdToggles() {
  document.querySelectorAll(".pwd-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const inp = $(btn.dataset.target);
      inp.type = inp.type === "password" ? "text" : "password";
    });
  });
}

/* ── Firebase Auth persistence (Keep login saved) ────── */
const SAVED_LOGIN_KEY = "AppQuiz:savedLoginEmail";
const SAVED_PASS_KEY = "AppQuiz:savedLoginPass";
const REMEMBER_KEY = "AppQuiz:rememberLogin";

async function applyPersistence() {
  // Always use LOCAL persistence so the user stays logged in after closing
  // and reopening the Electron app/browser. The old SESSION mode forgot
  // the login when "Remember me" was not checked.
  if (!window.firebaseAuth || !window.firebase || !window.firebase.auth || !window.firebase.auth.Auth) return;
  await window.firebaseAuth.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);
  return true;
}

function saveLoginEmail(email, pass) {
  try {
    const remember = $("remember-me");
    const keep = !remember || remember.checked;

    if (keep) {
      localStorage.setItem(REMEMBER_KEY, "1");
      localStorage.setItem(SAVED_LOGIN_KEY, email || "");
      // Electron/Firebase sometimes does not restore the auth session from file://.
      // This fallback lets "Remember me" sign the user back in automatically.
      localStorage.setItem(SAVED_PASS_KEY, btoa(unescape(encodeURIComponent(pass || ""))));
    } else {
      clearSavedLogin();
    }
  } catch (_) {}
}

function clearSavedLogin() {
  try {
    localStorage.removeItem(REMEMBER_KEY);
    localStorage.removeItem(SAVED_PASS_KEY);
    localStorage.removeItem(SAVED_LOGIN_KEY);
  } catch (_) {}
}

function getSavedLogin() {
  try {
    const remember = localStorage.getItem(REMEMBER_KEY) === "1";
    const email = localStorage.getItem(SAVED_LOGIN_KEY) || "";
    const encoded = localStorage.getItem(SAVED_PASS_KEY) || "";
    const pass = encoded ? decodeURIComponent(escape(atob(encoded))) : "";
    return remember && email && pass ? { email, pass } : null;
  } catch (_) {
    return null;
  }
}

function restoreLoginEmail() {
  try {
    const email = localStorage.getItem(SAVED_LOGIN_KEY) || "";
    const loginEmail = $("login-email");
    const remember = $("remember-me");
    if (loginEmail && email) loginEmail.value = email;
    if (remember) remember.checked = localStorage.getItem(REMEMBER_KEY) === "1" || !!email;
  } catch (_) {}
}

async function autoLoginIfRemembered() {
  const saved = getSavedLogin();
  if (!saved || !window.firebaseAuth) return null;
  try {
    await applyPersistence();
    Loading.show("auth-screen", "Restoring login...");
    const cred = await window.firebaseAuth.signInWithEmailAndPassword(saved.email, saved.pass);
    Loading.hide("auth-screen");
    return cred.user || null;
  } catch (err) {
    Loading.hide("auth-screen");
    console.warn("[Auth] Saved login failed:", err && err.code ? err.code : err);
    // Keep email, but remove old password so the user can type a new one.
    try { localStorage.removeItem(SAVED_PASS_KEY); } catch (_) {}
    return null;
  }
}

/* ── Enter app: show app screen + update user UI ─────── */
function enterApp(user) {
  hideEl("auth-screen");
  showEl("app-screen");

  const name = user ? (user.displayName || user.email || "User") : "Guest";
  const email = user ? (user.email || "") : "";
  const photo = user ? (user.photoURL || "") : "";
  const initials = name.slice(0, 2).toUpperCase();

  // Update avatar — show photo if available, otherwise initials
  const avatarBtn = $("user-avatar-btn");
  if (avatarBtn) {
    if (photo) {
      avatarBtn.innerHTML = `<img src="${photo}" alt="${name}" class="user-avatar-img" referrerpolicy="no-referrer" />`;
    } else {
      avatarBtn.innerHTML = `<span id="user-initials">${initials}</span>`;
    }
  }

  // Update dropdown profile info
  if ($("dropdown-name")) $("dropdown-name").textContent = name;
  if ($("dropdown-email")) $("dropdown-email").textContent = email;

  // Show name in header (visible without opening dropdown)
  const headerName = $("header-username");
  if (headerName) headerName.textContent = name;

  // Profile card photo
  const profilePhoto = $("profile-photo");
  if (profilePhoto) {
    if (photo) {
      profilePhoto.src = photo;
      profilePhoto.classList.remove("hidden");
    } else {
      profilePhoto.classList.add("hidden");
    }
  }

  updateConnUI(navigator.onLine);
  window._authUser = user || null;

  if (user) {
    Toast.success(`Welcome, ${name}!`);
  }

  document.dispatchEvent(new CustomEvent("appReady", { detail: { user } }));
}

/* ── Email / Password -> Login ───────────────────────── */
async function handleLogin() {
  const email = $("login-email").value.trim();
  const pass = $("login-password").value;
  setError("login-error", "");

  if (!email || !pass) {
    setError("login-error", "Please fill in all fields.");
    return;
  }

  setBusy("login-btn", true);
  Loading.show("auth-screen", "Signing in...");

  try {
    await applyPersistence();
    await window.firebaseAuth.signInWithEmailAndPassword(email, pass);
    saveLoginEmail(email, pass);
  } catch (err) {
    setError("login-error", friendlyError(err.code));
    Toast.error(friendlyError(err.code));
    setBusy("login-btn", false);
  } finally {
    Loading.hide("auth-screen");
  }
}

/* ── Email / Password -> Register ────────────────────── */
async function handleRegister() {
  const name = $("reg-name").value.trim();
  const email = $("reg-email").value.trim();
  const pass = $("reg-password").value;
  const confirm = $("reg-confirm").value;
  setError("reg-error", "");

  if (!name || !email || !pass || !confirm) {
    setError("reg-error", "Please fill in all fields.");
    return;
  }
  if (pass.length < 6) {
    setError("reg-error", "Password must be at least 6 characters.");
    return;
  }
  if (pass !== confirm) {
    setError("reg-error", "Passwords do not match.");
    return;
  }

  setBusy("reg-btn", true);
  Loading.show("auth-screen", "Creating account...");

  try {
    const cred = await window.firebaseAuth.createUserWithEmailAndPassword(email, pass);
    await cred.user.updateProfile({ displayName: name });
  } catch (err) {
    setError("reg-error", friendlyError(err.code));
    Toast.error(friendlyError(err.code));
    setBusy("reg-btn", false);
  } finally {
    Loading.hide("auth-screen");
  }
}

/* ── Google Sign-In ──────────────────────────────────── */
async function handleGoogle() {
  setError("login-error", "");
  Loading.show("auth-screen", "Signing in with Google...");

  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");

    await window.firebaseAuth.signInWithPopup(provider);
  } catch (err) {
    Loading.hide("auth-screen");
    const code = err.code || "";

    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      Toast.info("Sign-in cancelled.");
      return;
    }

    if (code === "auth/popup-blocked") {
      Toast.warning("Popup blocked. Trying redirect...");
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope("profile");
        provider.addScope("email");
        await window.firebaseAuth.signInWithRedirect(provider);
        return;
      } catch (redirectErr) {
        setError("login-error", friendlyError(redirectErr.code));
        Toast.error("Google sign-in failed. Please try again.");
        return;
      }
    }

    if (code === "auth/unauthorized-domain") {
      setError("login-error", "This domain is not authorized for Google sign-in. Add localhost to Firebase Auth authorized domains.");
      Toast.error("Unauthorized domain. Check Firebase console.");
      return;
    }

    setError("login-error", friendlyError(code));
    Toast.error(friendlyError(code));
  }
}

/* ── Facebook Sign-In ────────────────────────────────── */
async function handleFacebook() {
  setError("login-error", "");
  Loading.show("auth-screen", "Signing in with Facebook...");

  try {
    const provider = new firebase.auth.FacebookAuthProvider();
    await window.firebaseAuth.signInWithPopup(provider);
  } catch (err) {
    Loading.hide("auth-screen");
    const code = err.code || "";

    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      Toast.info("Sign-in cancelled.");
      return;
    }

    setError("login-error", friendlyError(code));
    Toast.error(friendlyError(code));
  }
}

/* ── Forgot Password ─────────────────────────────────── */
async function handleForgot() {
  const email = $("login-email").value.trim();
  if (!email) {
    setError("login-error", "Enter your email above first.");
    return;
  }
  try {
    await window.firebaseAuth.sendPasswordResetEmail(email);
    Toast.success("Reset email sent! Check your inbox.");
    setError("login-error", "");
  } catch (err) {
    setError("login-error", friendlyError(err.code));
  }
}

/* ── Friendly Firebase error messages ────────────────── */
function friendlyError(code) {
  const map = {
    "auth/user-not-found":        "No account found with that email.",
    "auth/wrong-password":        "Incorrect password.",
    "auth/invalid-email":         "Invalid email address.",
    "auth/email-already-in-use":  "That email is already registered.",
    "auth/weak-password":         "Password is too weak.",
    "auth/too-many-requests":     "Too many attempts. Try again later.",
    "auth/popup-closed-by-user":  "Sign-in popup was closed.",
    "auth/popup-blocked":         "Popup was blocked by the browser.",
    "auth/cancelled-popup-request": "Sign-in was cancelled.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/unauthorized-domain":   "This domain is not authorized.",
    "auth/invalid-credential":    "Invalid credentials. Please try again.",
    "auth/account-exists-with-different-credential": "An account already exists with this email using a different sign-in method.",
  };
  return map[code] || ("Error: " + code);
}

/* ── Logout ──────────────────────────────────────────── */
async function handleLogout() {
  try {
    await window.firebaseAuth.signOut();
    clearSavedLogin();

    // Clear auth state
    window._authUser = null;

    // Clear local progress
    if (window.Database) {
      Database.clearLocalProgress();
    }

    // Reset UI
    hideEl("app-screen");
    showEl("auth-screen");

    // Close user dropdown
    const dropdown = $("user-dropdown");
    if (dropdown) dropdown.classList.remove("open");

    // Reset form fields
    const loginEmail = $("login-email");
    const loginPass = $("login-password");
    if (loginEmail) loginEmail.value = "";
    if (loginPass) loginPass.value = "";

    // Reset avatar and header name
    const avatarBtn = $("user-avatar-btn");
    if (avatarBtn) avatarBtn.innerHTML = '<span id="user-initials">?</span>';
    const headerName = $("header-username");
    if (headerName) headerName.textContent = "";

    Toast.info("Signed out successfully.");
  } catch (err) {
    console.error("[Auth] Logout error:", err);
    Toast.error("Failed to sign out. Please try again.");
  }
}

/* ── User avatar dropdown toggle ─────────────────────── */
function initUserMenu() {
  const btn = $("user-avatar-btn");
  const settingsBtn = $("settings-icon-btn");
  const drop = $("user-dropdown");
  if (!drop) return;
  [btn, settingsBtn].filter(Boolean).forEach(button => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      drop.classList.toggle("open");
    });
  });
  drop.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("click", () => drop.classList.remove("open"));
}

/* ── Bootstrap ───────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", async () => {
  const splashDone = runSplash();

  initTabs();
  initPwdToggles();
  restoreLoginEmail();
  await applyPersistence();

  // Wire up form events
  $("login-btn").addEventListener("click", handleLogin);
  $("reg-btn").addEventListener("click", handleRegister);
  $("google-btn").addEventListener("click", handleGoogle);
  $("facebook-btn").addEventListener("click", handleFacebook);
  $("forgot-btn").addEventListener("click", handleForgot);
  $("offline-play-btn").addEventListener("click", () => {
    hideEl("auth-screen");
    enterApp(null);
  });

  // Enter on inputs
  [$("login-email"), $("login-password")].forEach(inp => {
    if (inp) inp.addEventListener("keydown", e => { if (e.key === "Enter") handleLogin(); });
  });

  // Wait for both splash animation AND Firebase auth state
  const authPromise = new Promise(resolve => {
    if (!window.firebaseAuth || !window.firebaseAuth.onAuthStateChanged) {
      resolve(null);
      return;
    }
    const unsub = window.firebaseAuth.onAuthStateChanged(user => {
      unsub();
      resolve(user);
    });
    // Timeout in case Firebase never responds
    setTimeout(() => resolve(null), 5000);
  });

  await splashDone;
  const resolvedUser = await authPromise;

  // Hide splash
  const splash = $("splash-screen");
  splash.style.opacity = "0";
  splash.style.transition = "opacity 0.4s ease";
  setTimeout(() => splash.classList.add("hidden"), 400);

  if (resolvedUser) {
    enterApp(resolvedUser);
  } else {
    updateConnUI(navigator.onLine);
    showEl("auth-screen");
    const rememberedUser = await autoLoginIfRemembered();
    if (rememberedUser) {
      enterApp(rememberedUser);
    }
  }

  // Listen for future auth changes (login, register, social)
  if (window.firebaseAuth && window.firebaseAuth.onAuthStateChanged) {
    window.firebaseAuth.onAuthStateChanged(user => {
      if (user && $("app-screen").classList.contains("hidden")) {
        Loading.hide("auth-screen");
        setBusy("login-btn", false);
        setBusy("reg-btn", false);
        enterApp(user);
      }
    });
  }

  // Check for redirect result (fallback for popup-blocked scenarios)
  try {
    if (window.firebaseAuth && window.firebaseAuth.getRedirectResult) {
      const result = await window.firebaseAuth.getRedirectResult();
      if (result && result.user) {
        enterApp(result.user);
      }
    }
  } catch (err) {
    if (err.code && err.code !== "auth/no-auth-event") {
      console.warn("[Auth] Redirect result error:", err.code);
    }
  }

  // Logout + user menu
  initUserMenu();
  const logoutBtn = $("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleLogout();
    });
  }
});
