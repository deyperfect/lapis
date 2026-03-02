<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { useTheme } from '../components/Usetheme'
import ThemeToggle from '../components/Themetoggle.vue'

const auth = useAuthStore()
const router = useRouter()
const { theme } = useTheme()

const name = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
const localError = ref('')

const submit = async () => {
  localError.value = ''
  if (password.value !== confirm.value) {
    localError.value = 'Passwords do not match.'
    return
  }
  try {
  await auth.register({ username: name.value, email: email.value, password: password.value })
  auth.logout()  
  router.push({ name: 'login' })
} catch {
}
}
</script>

<template>
  <div class="login-wrapper" :class="theme">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>

    <div class="login-container">
      <!-- Left: Brand -->
      <div class="login-hero">
        <p class="login-brand-name">LAPIS</p>
      </div>

      <div class="login-divider"></div>

      <!-- Right: Form -->
      <div class="login-form-panel">
        <ThemeToggle />
        <div class="login-form-inner">
          <h1 class="login-title">Create account</h1>
          <p class="login-subtitle">Join and start writing today.</p>

          <form @submit.prevent="submit" class="d-grid gap-3">
            <!-- Name -->
            <div class="glass-input-group">
              <span class="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </span>
              <input v-model="name" type="text" placeholder="Username" class="glass-input" required />
            </div>

            <!-- Email -->
            <div class="glass-input-group">
              <span class="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input v-model="email" type="email" placeholder="Email address" class="glass-input" required />
            </div>

            <!-- Password -->
            <div class="glass-input-group">
              <span class="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input v-model="password" type="password" placeholder="Password" class="glass-input" required />
            </div>

            <!-- Confirm password -->
            <div class="glass-input-group">
              <span class="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 12l2 2 4-4"/><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input v-model="confirm" type="password" placeholder="Confirm password" class="glass-input" required />
            </div>

            <!-- Errors -->
            <div v-if="localError || auth.error" class="error-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ localError || auth.error }}
            </div>

            <button type="submit" class="login-btn" :disabled="auth.loading">
              <span v-if="auth.loading" class="btn-loader me-2"></span>
              {{ auth.loading ? 'Creating account...' : 'Create account' }}
            </button>
          </form>

          <div class="form-footer">
            <span>Already have an account?</span>
            <RouterLink to="/login" class="footer-link">Sign in</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.login-brand-name {
  font-family: 'DM Sans', sans-serif;
  font-size: 5rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #1a56db;
  margin: 0;
}
</style>