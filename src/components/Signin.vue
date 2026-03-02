<script setup>
import { ref } from 'vue'
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import { useTheme } from './Usetheme'
import ThemeToggle from './Themetoggle.vue'

const auth = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");

const { theme } = useTheme()

const submit = async () => {
  try {
    await auth.login({ email: email.value, password: password.value });
    router.push({ name: "home" });
  } catch {
    // auth.error already set by store
  }
}
</script>

<template>
  <div class="login-wrapper" :class="theme">
    <!-- Ambient orbs -->
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>

    <div class="login-container">

      <!-- Left: Brand -->
      <div class="login-hero">
        <p class="login-brand-name">LAPIS</p>
      </div>  

      <!-- Divider -->
      <div class="login-divider"></div>

      <!-- Right: Form -->
      <div class="login-form-panel">
        <ThemeToggle />
        <div class="login-form-inner">
          <h1 class="login-title">Welcome back</h1>
          <p class="login-subtitle">Sign in to your account.</p>

          <form @submit.prevent="submit" class="d-grid gap-3">
            <div class="glass-input-group">
              <span class="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input v-model="email" type="email" placeholder="Email address" class="glass-input" required />
            </div>

            <div class="glass-input-group">
              <span class="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input v-model="password" type="password" placeholder="Password" class="glass-input" required />
            </div>

            <div v-if="auth.error" class="error-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ auth.error }}
            </div>

            <button type="submit" class="login-btn" :disabled="auth.loading">
              <span v-if="auth.loading" class="btn-loader me-2"></span>
              {{ auth.loading ? "Signing in..." : "Sign in" }}
            </button>
          </form>

          <a href="#" class="forgot-link">Forgot password?</a>

          <div class="form-footer">
            <span>Don't have an account?</span>
            <RouterLink to="/register" class="footer-link">Sign up</RouterLink>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style>
/* ── Wrapper ── */
.login-wrapper {
  font-family: 'DM Sans', sans-serif;
  width: 100%;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg);
  position: relative;
  overflow: hidden;
  transition: background-color 0.4s ease;
}

.login-brand-name {
  font-family: 'DM Sans', sans-serif;
  font-size: 5rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #1a56db;
  margin: 0;
}

/* ── Glass container: the X-style split card ── */
.login-container {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: stretch;
  width: min(900px, 92vw);
  min-height: 480px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 28px;
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.18),
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 var(--glass-highlight);
  animation: cardIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  overflow: hidden;
}

/* ── Left: Logo ── */
.login-hero {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.hero-logo-icon {
  width: clamp(80px, 10vw, 140px);
  height: clamp(80px, 10vw, 140px);
  color: var(--text-primary);
  opacity: 0.9;
}

/* ── Divider ── */
.login-divider {
  width: 1px;
  background: var(--glass-border);
  margin: 2.5rem 0;
}

/* ── Right: Form ── */
.login-form-panel {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2.5rem;
}

.login-form-inner {
  width: 100%;
  max-width: 320px;
}

.login-wrapper .login-title {
  font-size: clamp(1.5rem, 2.5vw, 1.9rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 0.2rem;
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.login-wrapper .login-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 1.5rem;
}

/* ── Sign in button ── */
.login-btn {
  width: 100%;
  padding: 12px 20px;
  background: var(--text-primary);
  color: var(--bg);
  border: none;
  border-radius: 9999px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.82;
}

.login-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ── Footer ── */
.login-wrapper .forgot-link {
  display: block;
  font-size: 0.82rem;
  color: var(--text-secondary);
  text-decoration: none;
  margin-top: 0.85rem;
  transition: color 0.2s ease;
}

.login-wrapper .forgot-link:hover {
  color: var(--text-primary);
}

.form-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.footer-link {
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.footer-link:hover {
  opacity: 0.7;
}

/* ── Mobile: stack vertically ── */
@media (max-width: 640px) {
  .login-container {
    flex-direction: column;
    width: 92vw;
  }

  .login-hero {
    padding: 2rem 2rem 1rem;
    flex: none;
  }

  .hero-logo-icon {
    width: 56px;
    height: 56px;
  }

  .login-divider {
    width: auto;
    height: 1px;
    margin: 0 2rem;
  }

  .login-form-panel {
    padding: 1.5rem 2rem 2.5rem;
  }
}
</style>