/**
 * firebase-config.js
 * Firebase configuration and initialization.
 *
 * NOTE: Firebase web configs are safe to expose in frontend code.
 * Security is enforced via Firebase Security Rules, not by hiding the config.
 *
 * To use your own Firebase project:
 *   1. Go to https://console.firebase.google.com
 *   2. Project Settings -> General -> Your apps -> Web app
 *   3. Copy the firebaseConfig object here
 *   4. Enable Authentication providers (Email/Password, Google)
 *   5. Create a Firestore database
 */

const firebaseConfig = {
  apiKey: "AIzaSyBQQwxNLimK5Pxlc-IkIevXXUHUAf4ZZAs",
  authDomain: "genbrowserpro.firebaseapp.com",
  projectId: "genbrowserpro",
  storageBucket: "genbrowserpro.firebasestorage.app",
  messagingSenderId: "435569086952",
  appId: "1:435569086952:web:4bbe0cf820b55769d7d45d",
  measurementId: "G-ESGNL29YZB"
};


// Initialize Firebase
try {
  window.firebaseApp  = firebase.initializeApp(firebaseConfig);
  window.firebaseAuth = firebase.auth();
  window.firebaseDb   = firebase.firestore();

  // Enable Firestore offline persistence
  window.firebaseDb.enablePersistence({ synchronizeTabs: true })
    .catch(err => {
      if (err.code === 'failed-precondition') {
        console.warn('[Firebase] Persistence: multiple tabs open.');
      } else if (err.code === 'unimplemented') {
        console.warn('[Firebase] Persistence: not supported.');
      }
    });

  console.log('[Firebase] Initialized successfully');
} catch (err) {
  console.error('[Firebase] Initialization failed:', err);
  window.firebaseApp  = null;
  window.firebaseAuth = null;
  window.firebaseDb   = null;
}
