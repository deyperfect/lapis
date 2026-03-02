<script setup>
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { usePostsStore } from "../stores/posts";
import { useAuthStore } from "../stores/auth";
import { useTheme } from "./Usetheme";

const posts = usePostsStore();
const auth = useAuthStore();
const router = useRouter();
const { theme } = useTheme();

const LIMIT = 10;

const fetchPage = async (page = 1) => {
  await posts.fetchPosts(page, LIMIT);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(() => fetchPage(1));

const visiblePosts = computed(() => posts.posts);

const canGoPrev = computed(() => (posts.currentPage || 1) > 1);
const canGoNext = computed(() => (posts.currentPage || 1) < (posts.totalPages || 1));

const nextPage = () => {
  if (!canGoNext.value) return;
  fetchPage((posts.currentPage || 1) + 1);
};


console.log(auth.user);

const prevPage = () => {
  if (!canGoPrev.value) return;
  fetchPage((posts.currentPage || 1) - 1);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const excerpt = (content, length = 120) => {
  if (!content) return "";
  const plain = content.replace(/<[^>]*>/g, "");
  return plain.length > length ? plain.slice(0, length).trimEnd() + "…" : plain;
};

const goToPost = (id) => {
  router.push({ name: "postDetail", params: { postId: id } });
};
</script>

<template>
  <div class="home-page" :class="theme">

    <!-- Hero -->
    <section class="home-hero">
      <div class="home-hero-inner">
         <p class="home-hero-appname">LAPIS</p>
        <h1 class="home-hero-title">No filters. No algorithms. <br/>Just people, writing.</h1>
        <RouterLink v-if="auth.isAuthenticated" to="/create" class="home-hero-cta">
          Start writing
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </RouterLink>
      </div>
    </section>

    <!-- Posts grid -->
    <section class="home-grid-section">

      <!-- Loading -->
      <div v-if="posts.loading" class="home-grid">
        <div v-for="n in 6" :key="n" class="post-card post-card-skeleton">
          <div class="skeleton-tag"></div>
          <div class="skeleton-title"></div>
          <div class="skeleton-title short"></div>
          <div class="skeleton-body"></div>
          <div class="skeleton-body short"></div>
          <div class="skeleton-footer">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-meta"></div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="posts.error" class="home-error">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>{{ posts.error }}</p>
        <button class="home-retry" @click="fetchPage(posts.currentPage || 1)">Try again</button>
      </div>

      <!-- Empty -->
      <div v-else-if="visiblePosts.length === 0" class="home-empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
        <p>No posts yet. Be the first to write something.</p>
        <RouterLink v-if="auth.isAuthenticated" to="/create" class="home-retry">Write a post</RouterLink>
      </div>

      <!-- Posts -->
      <div v-else class="home-grid">
        <article
          v-for="(post, i) in visiblePosts"
          :key="post._id"
          class="post-card"
          :class="{ 'post-card-featured': i === 0 }"
          @click="goToPost(post._id)"
        >
          <div class="post-card-inner">
            <!-- Author row -->
            <div class="post-meta">
            <div class="post-avatar">
                {{
                (typeof post.author === "string"
                    ? post.author
                    : post.author?.username || "A"
                )
                    .charAt(0)
                    .toUpperCase()
                }}
            </div>

            <div class="post-meta-info">
                <span class="post-author">
                {{
                    typeof post.author === "string"
                    ? post.author
                    : post.author?.username || "Anonymous"
                }}
                </span>
                <span class="post-date">{{ formatDate(post.createdAt || post.created_at) }}</span>
            </div>
            </div>

            <!-- Content -->
            <div class="post-content">
              <h2 class="post-title">{{ post.title }}</h2>
              <p class="post-excerpt">{{ excerpt(post.body || post.content) }}</p>
            </div>

            <!-- Footer -->
            <div class="post-footer">
              <span class="post-read-time">
                {{ Math.max(1, Math.ceil((post.body || post.content || '').split(' ').length / 200)) }} min read
              </span>
              <span class="post-read-more">
                Read
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </span>
            </div>
          </div>
        </article>
      </div>

      <div v-if="!posts.loading && !posts.error && posts.totalPages > 1" class="pager">
        <button class="pager-btn" :disabled="!canGoPrev" @click="prevPage">Prev</button>

        <span class="pager-meta">
            Page {{ posts.currentPage }} of {{ posts.totalPages }}
        </span>

        <button class="pager-btn" :disabled="!canGoNext" @click="nextPage">Next</button>
    </div>
    </section>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');

/* ── Page ── */
.home-page {
  font-family: 'DM Sans', sans-serif;
  min-height: 100dvh;
  background-color: var(--bg);
  transition: background-color 0.4s ease;
}

/* ── Hero ── */
.home-hero {
  padding: 5rem 2rem 3rem;
  max-width: 900px;
  margin: 0 auto;
}

.home-hero-eyebrow {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

.home-hero-appname {
  font-family: 'DM Sans', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #1a56db;
  margin: 0 0 1.25rem;
}

.home-hero-title {
  font-family: 'DM Sans', serif;
  font-size: clamp(2.5rem, 6vw, 3rem);
  color: var(--text-primary);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0 0 2rem;
}

.home-hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 22px;
  border-radius: 9999px;
  background: var(--text-primary);
  color: var(--bg);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.home-hero-cta:hover { opacity: 0.82; }

/* ── Grid section ── */
.home-grid-section {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem 8rem;
}

/* ── Grid layout ── */
.home-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

/* Featured post spans full width */
.post-card-featured {
  grid-column: 1 / -1;
}

/* ── Post card ── */
.post-card {
  border-radius: 18px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  box-shadow: 0 2px 16px rgba(0,0,0,0.08), inset 0 1px 0 var(--glass-highlight);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  animation: fadeUp 0.5s ease both;
  overflow: hidden;
}

.post-card:nth-child(1) { animation-delay: 0s; }
.post-card:nth-child(2) { animation-delay: 0.07s; }
.post-card:nth-child(3) { animation-delay: 0.14s; }
.post-card:nth-child(4) { animation-delay: 0.21s; }
.post-card:nth-child(5) { animation-delay: 0.28s; }
.post-card:nth-child(6) { animation-delay: 0.35s; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.post-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.14), inset 0 1px 0 var(--glass-highlight);
}

.post-card-inner {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.post-card-featured .post-card-inner {
  padding: 2rem;
}

/* ── Author row ── */
.post-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.post-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.post-meta-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.post-author {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
}

.post-date {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* ── Content ── */
.post-content { flex: 1; }

.post-title {
  font-family: 'DM Sans', serif;
  font-size: 1.1rem;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
  line-height: 1.35;
  letter-spacing: -0.01em;
}

.post-card-featured .post-title {
  font-size: 1.6rem;
}

.post-excerpt {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.65;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card-featured .post-excerpt {
  -webkit-line-clamp: 2;
  font-size: 0.95rem;
}

/* ── Footer ── */
.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid var(--glass-border);
}

.post-read-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.post-read-more {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-primary);
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.post-card:hover .post-read-more { opacity: 1; }

/* ── Loading skeletons ── */
.post-card-skeleton {
  cursor: default;
  pointer-events: none;
}

.post-card-skeleton .post-card-inner {
  gap: 0.75rem;
}

.skeleton-tag, .skeleton-title, .skeleton-body, .skeleton-avatar, .skeleton-meta, .skeleton-footer {
  border-radius: 6px;
  background: var(--input-bg);
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.9; }
}

.skeleton-tag    { height: 10px; width: 60px; }
.skeleton-title  { height: 14px; width: 90%; margin-top: 4px; }
.skeleton-title.short { width: 60%; }
.skeleton-body   { height: 10px; width: 100%; }
.skeleton-body.short { width: 75%; }
.skeleton-footer { display: flex; align-items: center; gap: 8px; background: transparent; margin-top: 4px; }
.skeleton-avatar { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; }
.skeleton-meta   { height: 10px; width: 80px; }

/* ── Error / Empty states ── */
.home-error, .home-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 5rem 2rem;
  color: var(--text-secondary);
  text-align: center;
}

.home-retry {
  padding: 9px 20px;
  border-radius: 9999px;
  background: var(--input-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  font-family: 'DM Sans', sans-serif;
  transition: background 0.2s ease;
}

.home-retry:hover { background: var(--btn-hover); }

/* ── Responsive ── */
@media (max-width: 700px) {
  .home-grid {
    grid-template-columns: 1fr;
  }
  .post-card-featured {
    grid-column: 1;
  }
  .home-hero { padding: 3rem 1.25rem 2rem; }
  .home-grid-section { padding: 0 1.25rem 8rem; }
}

.pager {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin: 24px 0 0;
}

.pager-btn {
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  background: rgba(128, 128, 128, 0.08);
  color: var(--text-primary);
  font-weight: 800;
  cursor: pointer;
}

.pager-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pager-meta {
  color: var(--text-secondary);
  font-weight: 700;
  font-size: 0.9rem;
}
</style>