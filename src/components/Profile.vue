<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { usePostsStore } from '../stores/posts'
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/Usetheme.js'

const auth = useAuthStore()
const posts = usePostsStore()
const router = useRouter()
const { theme } = useTheme()

const username = computed(() => auth.user?.username || 'User')
const email = computed(() => auth.user?.email || '')
const initial = computed(() => username.value.charAt(0).toUpperCase())

const myPosts = computed(() =>
  posts.posts.filter(p =>
    p.author?._id === auth.user?._id ||
    p.author === auth.user?._id
  )
)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(() => posts.fetchPosts(1, 50))

const deletePost = async (id) => {
  if (!confirm('Delete this post?')) return
  await posts.deletePost(id)
}
</script>

<template>
  <div class="profile-page" :class="theme">
    <div class="profile-inner">

      <!-- Profile card -->
      <div class="glass-card profile-card">
        <div class="profile-avatar-lg">{{ initial }}</div>
        <div class="profile-info">
          <h1 class="profile-name">{{ username }}</h1>
          <p class="profile-email">{{ email }}</p>
        </div>
        <RouterLink to="/create" class="profile-write-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New post
        </RouterLink>
      </div>

      <!-- Posts section -->
      <div class="profile-posts-header">
        <h2 class="profile-section-title">Your posts</h2>
        <span class="profile-post-count">{{ myPosts.length }}</span>
      </div>

      <!-- Loading -->
      <div v-if="posts.loading" class="profile-posts-list">
        <div v-for="n in 3" :key="n" class="profile-post-item glass-card">
          <div class="skeleton-title" style="width:60%"></div>
          <div class="skeleton-body" style="margin-top:8px"></div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="myPosts.length === 0" class="profile-empty">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <p>You haven't written anything yet.</p>
        <RouterLink to="/create" class="home-retry">Write your first post</RouterLink>
      </div>

      <!-- Posts list -->
      <div v-else class="profile-posts-list">
        <div
          v-for="post in myPosts"
          :key="post._id"
          class="profile-post-item glass-card"
        >
          <div class="profile-post-content" @click="router.push({ name: 'postDetail', params: { postId: post._id } })">
            <h3 class="profile-post-title">{{ post.title }}</h3>
            <p class="profile-post-date">{{ formatDate(post.createdAt || post.created_at) }}</p>
          </div>
          <button class="profile-delete-btn" @click="deletePost(post._id)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style>
.profile-page {
  font-family: 'DM Sans', sans-serif;
  min-height: 100dvh;
  background-color: var(--bg);
  transition: background-color 0.4s ease;
  padding-bottom: 100px;
}

.profile-inner {
  max-width: 680px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
}

/* ── Profile card ── */
.profile-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.75rem 2rem;
  margin-bottom: 2rem;
  max-width: 100%;
}

.profile-avatar-lg {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-size: 1.4rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile-info { flex: 1; min-width: 0; }

.profile-name {
  font-family: 'DM Serif Display', serif;
  font-size: 1.4rem;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.profile-email {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0.2rem 0 0;
}

.profile-write-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 9999px;
  background: var(--text-primary);
  color: var(--bg);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  flex-shrink: 0;
  transition: opacity 0.2s ease;
}

.profile-write-btn:hover { opacity: 0.82; }

/* ── Posts section ── */
.profile-posts-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem;
}

.profile-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.profile-post-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--input-bg);
  border: 1px solid var(--glass-border);
  border-radius: 9999px;
  padding: 2px 9px;
}

.profile-posts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.profile-post-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  max-width: 100%;
  cursor: pointer;
  transition: transform 0.18s ease;
}

.profile-post-item:hover { transform: translateX(4px); }

.profile-post-content { flex: 1; min-width: 0; }

.profile-post-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-post-date {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin: 0;
}

.profile-delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.18s ease;
}

.profile-delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* ── Empty ── */
.profile-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 2rem;
  color: var(--text-secondary);
  text-align: center;
}
</style>