<script setup>
import { computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";

const props = defineProps({
  theme: { type: String, default: "dark" },
});

const emit = defineEmits(["toggle-theme"]);

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

// Load user on refresh if token exists but user isn't hydrated yet
onMounted(() => {
  if (auth.token && !auth.user) {
    auth.fetchMe().catch(() => {});
  }
});

const username = computed(() => {
  return (
    auth.user?.username ||
    auth.user?.name ||
    auth.user?.email || // optional fallback if your API returns email
    null
  );
});

const initial = computed(() => (username.value ? username.value.charAt(0).toUpperCase() : "?"));

const logout = () => {
  auth.logout();
  router.push({ name: "home" });
};
</script>

<template>
  <nav v-if="auth.isAuthenticated" class="bottom-nav" :class="theme">
    <!-- Home -->
    <RouterLink to="/" class="bn-item" :class="{ active: route.path === '/' }">
      <span class="bn-item-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </span>
      <span class="bn-item-label">Home</span>
    </RouterLink>

    <RouterLink v-if="auth.user?.role === 'admin'" to="/admin" class="bn-item bn-item-write" :class="{ active: route.path === '/admine' }">
      <span class="bn-item-icon">

      </span>
      <span class="bn-item-label">Dashboard</span>
    </RouterLink>

    <RouterLink v-else to="/create" class="bn-item bn-item-write" :class="{ active: route.path === '/create' }">
      <span class="bn-item-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </span>
      <span class="bn-item-label">Write</span>
    </RouterLink>

    <!-- Profile (FIXED LINK) -->
    <RouterLink to="/profile" class="bn-item" :class="{ active: route.path === '/profile' }">
      <span class="bn-item-icon">
        <span v-if="username" class="bn-avatar">{{ initial }}</span>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      </span>

      <span class="bn-item-label">
        <span v-if="username">{{ username }}</span>
        <span v-else class="bn-skeleton"></span>
      </span>
    </RouterLink>

    <!-- Theme toggle -->
    <button
      class="bn-item bn-btn"
      @click="emit('toggle-theme')"
      :title="theme === 'dark' ? 'Light mode' : 'Dark mode'"
      type="button"
    >
      <span class="bn-item-icon">
        <svg v-if="theme === 'dark'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </span>
      <span class="bn-item-label">{{ theme === "dark" ? "Light" : "Dark" }}</span>
    </button>

    <!-- Logout -->
    <button class="bn-item bn-btn bn-logout" @click="logout" type="button">
      <span class="bn-item-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </span>
      <span class="bn-item-label">Logout</span>
    </button>
  </nav>

  <nav v-else class="bottom-nav" :class="theme">
    <!-- Home -->
    <RouterLink to="/" class="bn-item" :class="{ active: route.path === '/' }">
      <span class="bn-item-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </span>
      <span class="bn-item-label">Home</span>
    </RouterLink>

    <!-- Write -->
    <RouterLink to="/login" class="bn-item bn-item-write" :class="{ active: route.path === '/login' }">
      <span class="bn-item-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </span>
      <span class="bn-item-label">Write</span>
    </RouterLink>



    <!-- Theme toggle -->
    <button
      class="bn-item bn-btn"
      @click="emit('toggle-theme')"
      :title="theme === 'dark' ? 'Light mode' : 'Dark mode'"
      type="button"
    >
      <span class="bn-item-icon">
        <svg v-if="theme === 'dark'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </span>
      <span class="bn-item-label">{{ theme === "dark" ? "Light" : "Dark" }}</span>
    </button>

    <!-- Login -->
    <RouterLink to="/login" class="bn-item bn-btn bn-login" >
      <span class="bn-item-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </span>
      <span class="bn-item-label">Login</span>
    </RouterLink>
  </nav>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

.bottom-nav {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 9999px;
  font-family: 'DM Sans', sans-serif;
  white-space: nowrap;
  width: min(600px, calc(100vw - 40px));
  animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;

  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(32px) saturate(200%);
  -webkit-backdrop-filter: blur(32px) saturate(200%);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.2),
    0 2px 8px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 var(--glass-highlight);
}

.dark.bottom-nav {
  background: rgba(12, 12, 12, 0.82);
  border-color: rgba(255, 255, 255, 0.1);
}

.light.bottom-nav {
  background: rgba(255, 255, 255, 0.75);
  border-color: rgba(0, 0, 0, 0.08);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateX(-50%) translateY(24px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* ── Items ── */
.bn-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  flex: 1;
  padding: 8px 12px;
  border-radius: 9999px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.18s ease;
}

.bn-item:hover {
  background: var(--input-bg);
  color: var(--text-primary);
}

.bn-item.active {
  background: var(--input-bg);
  color: var(--text-primary);
  font-weight: 600;
}

.bn-item-write {
  background: var(--text-primary);
  color: var(--bg) !important;
  font-weight: 600;
}

.bn-item-write:hover {
  opacity: 0.85;
  background: var(--text-primary) !important;
}

.bn-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
}

.bn-logout:hover {
  background: rgba(239, 68, 68, 0.12) !important;
  color: #ef4444 !important;
}

.bn-item-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* ── Avatar initial ── */
.bn-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Skeleton for username while loading ── */
.bn-skeleton {
  display: inline-block;
  width: 48px;
  height: 10px;
  border-radius: 9999px;
  background: var(--input-bg);
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 1; }
}

/* ── Mobile: icons only ── */
@media (max-width: 480px) {
  .bn-item-label { display: none; }
  .bottom-nav { width: auto; }
}
</style>