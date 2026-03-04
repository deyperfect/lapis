<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { usePostsStore } from "../stores/posts";
import { useTheme } from "../composables/Usetheme.js";

const router = useRouter();
const auth = useAuthStore();
const posts = usePostsStore();
const { theme } = useTheme();

// ── Guard ──────────────────────────────────────────────────────────────
if (!auth.isAuthenticated || auth.user?.role !== "admin") {
  router.replace({ name: "home" });
}

// ── State ──────────────────────────────────────────────────────────────
const activeSection = ref("posts");
const confirmDeleteId = ref(null);
const deleteLoading = ref(false);
const sidebarOpen = ref(false);
const searchQuery = ref("");

// ── Data ───────────────────────────────────────────────────────────────
onMounted(() => posts.fetchPosts(1, 100)); // fetch all for admin view

const allPosts = computed(() => posts.posts);

const filteredPosts = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return allPosts.value;
  return allPosts.value.filter(
    (p) =>
      p.title?.toLowerCase().includes(q) ||
      (typeof p.author === "string" ? p.author : p.author?.username || "")
        .toLowerCase()
        .includes(q)
  );
});

const stats = computed(() => ({
  totalPosts: allPosts.value.length,
  authors: new Set(
    allPosts.value.map((p) =>
      typeof p.author === "string" ? p.author : p.author?.username
    )
  ).size,
  latest: allPosts.value[0]?.createdAt || allPosts.value[0]?.created_at || null,
}));

// ── Actions ────────────────────────────────────────────────────────────
const confirmDelete = (id) => (confirmDeleteId.value = id);
const cancelDelete = () => (confirmDeleteId.value = null);

const executeDelete = async () => {
  if (!confirmDeleteId.value) return;
  deleteLoading.value = true;
  try {
    await posts.deletePost(confirmDeleteId.value);
  } finally {
    deleteLoading.value = false;
    confirmDeleteId.value = null;
  }
};

// ── Helpers ────────────────────────────────────────────────────────────
const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const authorName = (author) =>
  typeof author === "string" ? author : author?.username || "Anonymous";

const initials = (name) => name.charAt(0).toUpperCase();
</script>

<template>
  <div class="adm-root" :class="theme">

    <!-- ── Mobile overlay ── -->
    <transition name="fade">
      <div v-if="sidebarOpen" class="adm-overlay" @click="sidebarOpen = false" />
    </transition>

    <!-- ── Sidebar ── -->
    <aside class="adm-sidebar" :class="{ 'adm-sidebar-open': sidebarOpen }">
      <div class="adm-sidebar-header">
      </div>

      <nav class="adm-nav">
        <button
          class="adm-nav-item"
          :class="{ active: activeSection === 'posts' }"
          @click="activeSection = 'posts'; sidebarOpen = false"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Posts
          <span class="adm-nav-badge">{{ allPosts.length }}</span>
        </button>

 
      </nav>

      <div class="adm-sidebar-footer">
        <div class="adm-user-chip">
          <div class="adm-user-avatar">{{ initials(auth.user?.username || 'A') }}</div>
          <div class="adm-user-info">
            <span class="adm-user-name">{{ auth.user?.username || 'Admin' }}</span>
            <span class="adm-user-role">Administrator</span>
          </div>
        </div>
        <button class="adm-back-btn" @click="router.push({ name: 'home' })">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to site
        </button>
      </div>
    </aside>

    <!-- ── Main content ── -->
    <main class="adm-main">

      <!-- Topbar -->
      <header class="adm-topbar">
        <button class="adm-burger" @click="sidebarOpen = !sidebarOpen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <h1 class="adm-page-title">
          {{ activeSection === 'posts' ? 'Manage Posts' : 'Overview' }}
        </h1>
      </header>

      <!-- ── Overview section ── -->
      <section v-if="activeSection === 'overview'" class="adm-section">
        <div class="adm-stats-grid">
          <div class="adm-stat-card">
            <p class="adm-stat-label">Total Posts</p>
            <p class="adm-stat-value">{{ stats.totalPosts }}</p>
          </div>
          <div class="adm-stat-card">
            <p class="adm-stat-label">Unique Authors</p>
            <p class="adm-stat-value">{{ stats.authors }}</p>
          </div>
          <div class="adm-stat-card">
            <p class="adm-stat-label">Latest Post</p>
            <p class="adm-stat-value adm-stat-value-sm">{{ formatDate(stats.latest) }}</p>
          </div>
        </div>
      </section>

      <!-- ── Posts section ── -->
      <section v-else-if="activeSection === 'posts'" class="adm-section">

        <!-- Search -->
        <div class="adm-toolbar">
          
          <span class="adm-result-count">{{ filteredPosts.length }} post{{ filteredPosts.length !== 1 ? 's' : '' }}</span>
        </div>

        <!-- Loading -->
        <div v-if="posts.loading" class="adm-loading">
          <div class="adm-spinner"></div>
          <span>Loading posts…</span>
        </div>

        <!-- Table -->
        <div v-else class="adm-table-wrap">
          <table class="adm-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Date</th>
                <th>Read time</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="post in filteredPosts"
                :key="post._id"
                class="adm-table-row"
              >
                <td class="adm-td-title">
                  <span class="adm-post-title">{{ post.title }}</span>
                </td>
                <td>
                  <div class="adm-author-cell">
                    <div class="adm-mini-avatar">{{ initials(authorName(post.author)) }}</div>
                    <span>{{ authorName(post.author) }}</span>
                  </div>
                </td>
                <td class="adm-td-muted">{{ formatDate(post.createdAt || post.created_at) }}</td>
                <td class="adm-td-muted">
                  {{ Math.max(1, Math.ceil((post.body || post.content || '').split(' ').length / 200)) }} min
                </td>
                <td class="adm-td-actions">
                  <button class="adm-view-btn" @click="router.push({ name: 'postDetail', params: { postId: post._id } })">
                    View
                  </button>
                  <button class="adm-delete-btn" @click="confirmDelete(post._id)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                    Delete
                  </button>
                </td>
              </tr>

              <tr v-if="filteredPosts.length === 0">
                <td colspan="5" class="adm-empty-row">No posts found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- ── Delete confirm modal ── -->
    <transition name="modal">
      <div v-if="confirmDeleteId" class="adm-modal-backdrop" @click.self="cancelDelete">
        <div class="adm-modal">
          <div class="adm-modal-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h3 class="adm-modal-title">Delete this post?</h3>
          <p class="adm-modal-body">This action cannot be undone. The post will be permanently removed.</p>
          <div class="adm-modal-actions">
            <button class="adm-modal-cancel" @click="cancelDelete">Cancel</button>
            <button class="adm-modal-confirm" :disabled="deleteLoading" @click="executeDelete">
              {{ deleteLoading ? 'Deleting…' : 'Yes, delete' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');

/* ── Root layout ── */
.adm-root {
  display: flex;
  min-height: 100dvh;
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  color: var(--text-primary);
}

/* ── Sidebar ── */
.adm-sidebar {
  width: 230px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--glass-bg);
  border-right: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  height: 100dvh;
  overflow-y: auto;
  z-index: 50;
  transition: transform 0.3s ease;
}

.adm-sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 1.75rem 1.5rem 1.25rem;
  border-bottom: 1px solid var(--glass-border);
}

.adm-logo-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  flex-shrink: 0;
}

.adm-logo-text {
  font-family: 'DM Serif Display', serif;
  font-size: 1.15rem;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

/* ── Nav ── */
.adm-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.adm-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease, color 0.15s ease;
}

.adm-nav-item:hover {
  background: var(--input-bg);
  color: var(--text-primary);
}

.adm-nav-item.active {
  background: var(--input-bg);
  color: var(--text-primary);
  font-weight: 600;
}

.adm-nav-badge {
  margin-left: auto;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 9999px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

/* ── Sidebar footer ── */
.adm-sidebar-footer {
  padding: 1rem 0.75rem 1.5rem;
  border-top: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.adm-user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--input-bg);
}

.adm-user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.adm-user-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.adm-user-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.adm-user-role {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.adm-back-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--text-secondary);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.adm-back-btn:hover {
  background: var(--input-bg);
  color: var(--text-primary);
}

/* ── Main ── */
.adm-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.adm-topbar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 1.25rem 2rem;
  border-bottom: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  position: sticky;
  top: 0;
  z-index: 40;
}

.adm-page-title {
  font-family: 'DM Serif Display', serif;
  font-size: 1.4rem;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.01em;
}

.adm-burger {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-primary);
  padding: 4px;
}

/* ── Section ── */
.adm-section {
  padding: 2rem;
  flex: 1;
}

/* ── Stats ── */
.adm-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  max-width: 700px;
}

.adm-stat-card {
  padding: 1.5rem;
  border-radius: 16px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.adm-stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin: 0 0 0.5rem;
}

.adm-stat-value {
  font-family: 'DM Serif Display', serif;
  font-size: 2.25rem;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.adm-stat-value-sm {
  font-size: 1.4rem;
}

/* ── Toolbar ── */
.adm-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.adm-search-wrap {
  position: relative;
  flex: 1;
  max-width: 360px;
}

.adm-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
}

.adm-search {
  width: 100%;
  padding: 9px 14px 9px 34px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: var(--input-bg);
  color: var(--text-primary);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.adm-search:focus {
  border-color: #6366f1;
}

.adm-result-count {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

/* ── Table ── */
.adm-table-wrap {
  border-radius: 16px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  overflow: hidden;
}

.adm-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.adm-table thead tr {
  border-bottom: 1px solid var(--glass-border);
}

.adm-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.adm-table-row {
  border-bottom: 1px solid var(--glass-border);
  transition: background 0.15s ease;
}

.adm-table-row:last-child {
  border-bottom: none;
}

.adm-table-row:hover {
  background: var(--input-bg);
}

.adm-table td {
  padding: 13px 16px;
  vertical-align: middle;
}

.adm-td-title {
  max-width: 260px;
}

.adm-post-title {
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.adm-td-muted {
  color: var(--text-secondary);
  white-space: nowrap;
}

.adm-author-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  color: var(--text-primary);
}

.adm-mini-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.adm-td-actions {
  text-align: right;
  white-space: nowrap;
}

.adm-view-btn,
.adm-delete-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--glass-border);
  transition: background 0.15s ease, color 0.15s ease;
}

.adm-view-btn {
  background: var(--input-bg);
  color: var(--text-primary);
  margin-right: 6px;
}

.adm-view-btn:hover {
  background: var(--glass-border);
}

.adm-delete-btn {
  background: transparent;
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.adm-delete-btn:hover {
  background: rgba(239, 68, 68, 0.08);
}

.adm-empty-row {
  text-align: center;
  color: var(--text-secondary);
  padding: 3rem !important;
}

/* ── Loading ── */
.adm-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem;
  color: var(--text-secondary);
}

.adm-spinner {
  width: 28px;
  height: 28px;
  border: 2.5px solid var(--glass-border);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Modal ── */
.adm-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}

.adm-modal {
  background: var(--bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 2rem;
  max-width: 380px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
  box-shadow: 0 24px 60px rgba(0,0,0,0.25);
}

.adm-modal-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
}

.adm-modal-title {
  font-family: 'DM Serif Display', serif;
  font-size: 1.3rem;
  color: var(--text-primary);
  margin: 0;
}

.adm-modal-body {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

.adm-modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 0.5rem;
  width: 100%;
}

.adm-modal-cancel,
.adm-modal-confirm {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--glass-border);
  transition: background 0.15s ease;
}

.adm-modal-cancel {
  background: var(--input-bg);
  color: var(--text-primary);
}

.adm-modal-cancel:hover { background: var(--glass-border); }

.adm-modal-confirm {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.adm-modal-confirm:hover:not(:disabled) { background: #dc2626; }
.adm-modal-confirm:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .adm-modal, .modal-leave-active .adm-modal { transition: transform 0.2s ease; }
.modal-enter-from .adm-modal, .modal-leave-to .adm-modal { transform: scale(0.95); }

/* ── Mobile ── */
.adm-overlay {
  display: none;
}

@media (max-width: 768px) {
  .adm-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100dvh;
    transform: translateX(-100%);
  }

  .adm-sidebar-open {
    transform: translateX(0);
    box-shadow: 4px 0 40px rgba(0,0,0,0.2);
  }

  .adm-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 49;
  }

  .adm-burger { display: flex; }

  .adm-section { padding: 1.25rem; }
  .adm-topbar { padding: 1rem 1.25rem; }

  .adm-stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .adm-table th:nth-child(3),
  .adm-table td:nth-child(3),
  .adm-table th:nth-child(4),
  .adm-table td:nth-child(4) {
    display: none;
  }
}
</style>