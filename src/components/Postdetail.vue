<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTheme } from "../composables/Usetheme.js";
import { useAuthStore } from "../stores/auth";
import api from "../api/api"; // <-- your axios instance with baseURL + token interceptor

const route = useRoute();
const router = useRouter();
const { theme } = useTheme();
const auth = useAuthStore();

const post = ref(null);
const comments = ref([]);

const loading = ref(true);
const saving = ref(false);
const error = ref("");

const isEditingPost = ref(false);
const editTitle = ref("");
const editContent = ref("");

const newComment = ref("");
const commentLoading = ref(false);

const editingCommentId = ref(null);
const editCommentText = ref("");

const postId = computed(() => route.params.postId);

const isAuthenticated = computed(() => auth.isAuthenticated);
const user = computed(() => auth.user);
const userId = computed(() => auth.user?._id || null);
const role = computed(() => auth.user?.role || "user");
const isAdmin = computed(() => role.value === "admin");

// owner: post.userId (string or object)
const ownerId = computed(() => {
  const p = post.value;
  if (!p) return null;
  return typeof p.userId === "object" ? p.userId?._id : p.userId;
});

const isOwner = computed(() => !!userId.value && userId.value === ownerId.value);

// Requirements:
// - Owner can update + delete
// - Admin can only delete (no update)
const canEditPost = computed(() => isAuthenticated.value && isOwner.value && !isAdmin.value);
const canDeletePost = computed(() => isAuthenticated.value && (isAdmin.value || isOwner.value));

// "other users can comment"
const canComment = computed(() => isAuthenticated.value && !isOwner.value);

const authorName = computed(() => post.value?.author || "Anonymous");

const wordCount = computed(() => (post.value?.content || "").split(/\s+/).filter(Boolean).length);
const readingTime = computed(() => Math.max(1, Math.ceil(wordCount.value / 200)));

const formattedDate = computed(() => {
  const raw = post.value?.createdAt || post.value?.updatedAt;
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
});

const toast = (msg) => {
  error.value = msg;
  setTimeout(() => {
    if (error.value === msg) error.value = "";
  }, 3500);
};

// ---------- Fetching ----------
const loadPost = async () => {
  const res = await api.get(`/posts/${postId.value}`);
  // backend: { success, data: post }
  post.value = res.data.data;

  editTitle.value = post.value?.title || "";
  editContent.value = post.value?.content || "";
};

const loadComments = async () => {
  const res = await api.get(`/posts/${postId.value}/comments`);
  comments.value = res.data.data || [];
};

const refresh = async () => {
  loading.value = true;
  try {
    await Promise.all([loadPost(), loadComments()]);
  } catch (err) {
    console.log(err?.response?.data || err);
    toast(err?.response?.data?.message || "Failed to load post.");
    post.value = null;
    comments.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  // ensure user is loaded for role/ownership logic
  if (auth.token && !auth.user) {
    try { await auth.fetchMe(); } catch {}
  }
  await refresh();
});

watch(postId, async () => {
  isEditingPost.value = false;
  editingCommentId.value = null;
  newComment.value = "";
  await refresh();
});

// ---------- Post actions ----------
const startEditPost = () => {
  if (!canEditPost.value) return;
  isEditingPost.value = true;
  editTitle.value = post.value?.title || "";
  editContent.value = post.value?.content || "";
};

const cancelEditPost = () => {
  isEditingPost.value = false;
  editTitle.value = post.value?.title || "";
  editContent.value = post.value?.content || "";
};

const savePost = async () => {
  if (!canEditPost.value) return;

  const title = editTitle.value.trim();
  const content = editContent.value.trim();

  if (!title || !content) {
    toast("Title and content are required.");
    return;
  }

  saving.value = true;
  try {
    const res = await api.patch(`/posts/${postId.value}`, { title, content });
    post.value = res.data.data;
    isEditingPost.value = false;
  } catch (err) {
    toast(err?.response?.data?.message || "Failed to update post.");
  } finally {
    saving.value = false;
  }
};

const deletePost = async () => {
  if (!canDeletePost.value) return;
  if (!confirm("Delete this post?")) return;

  saving.value = true;
  try {
    await api.delete(`/posts/${postId.value}`);
    router.push({ name: "home" });
  } catch (err) {
    toast(err?.response?.data?.message || "Failed to delete post.");
  } finally {
    saving.value = false;
  }
};

// ---------- Comment actions ----------
const submitComment = async () => {
  if (!canComment.value) return;

  const text = newComment.value.trim();
  if (!text) return;

  commentLoading.value = true;
  try {
    await api.post(`/posts/${postId.value}/comments`, { text });
    newComment.value = "";
    await loadComments();
  } catch (err) {
    toast(err?.response?.data?.message || "Failed to add comment.");
  } finally {
    commentLoading.value = false;
  }
};

// comment ownership check (backend uses comment.userId)
const commentOwnerId = (c) => (typeof c.userId === "object" ? c.userId?._id : c.userId);

const canEditComment = (c) => {
  const owner = commentOwnerId(c);
  return !!userId.value && owner === userId.value; // admin cannot edit per backend
};

const canDeleteComment = (c) => {
  const owner = commentOwnerId(c);
  return (!!userId.value && owner === userId.value) || isAdmin.value;
};

const startEditComment = (c) => {
  if (!canEditComment(c)) return;
  editingCommentId.value = c._id;
  editCommentText.value = c.text || "";
};

const cancelEditComment = () => {
  editingCommentId.value = null;
  editCommentText.value = "";
};

const saveComment = async (commentId) => {
  const text = editCommentText.value.trim();
  if (!text) {
    toast("Please provide updated comment text.");
    return;
  }

  commentLoading.value = true;
  try {
    await api.patch(`/posts/${postId.value}/comments/${commentId}`, { text });
    editingCommentId.value = null;
    editCommentText.value = "";
    await loadComments();
  } catch (err) {
    toast(err?.response?.data?.message || "Failed to update comment.");
  } finally {
    commentLoading.value = false;
  }
};

const deleteComment = async (commentId) => {
  if (!confirm("Delete this comment?")) return;

  commentLoading.value = true;
  try {
    await api.delete(`/posts/${postId.value}/comments/${commentId}`);
    await loadComments();
  } catch (err) {
    toast(err?.response?.data?.message || "Failed to delete comment.");
  } finally {
    commentLoading.value = false;
  }
};

const formatCommentDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};
</script>

<template>
  <div class="post-page" :class="theme">
    <div class="post-inner">
      <!-- Sticky top nav -->
      <nav class="post-nav">
        <button class="post-back-btn" type="button" @click="router.push({ name: 'home' })">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Back</span>
        </button>

        <div class="post-actions">
          <div v-if="post && !loading" class="post-meta-pill">
            <span class="meta-item">{{ readingTime }} min read</span>
            <span class="dot"></span>
            <span class="meta-item">{{ formattedDate }}</span>
          </div>

          <button v-if="canEditPost" class="action-btn" type="button" :disabled="saving" @click="startEditPost">
            Edit
          </button>

          <button v-if="canDeletePost" class="action-btn danger" type="button" :disabled="saving" @click="deletePost">
            Delete
          </button>
        </div>
      </nav>

      <main class="post-surface glass-card glass-card--wide">
        <!-- Loading -->
        <section v-if="loading" class="skeleton">
          <div class="sk-title"></div>
          <div class="sk-line"></div>
          <div class="sk-line short"></div>
        </section>

        <!-- Missing -->
        <section v-else-if="!post" class="empty-state">
          <h2>Post not found</h2>
          <p>This post might have been deleted or the link is incorrect.</p>
          <button class="primary" type="button" @click="router.push({ name: 'home' })">Go Home</button>
        </section>

        <!-- Content -->
        <section v-else class="post-content">
          <header class="post-header">
            <div class="author-row">
              <div class="author-avatar">{{ authorName.charAt(0).toUpperCase() }}</div>
              <div class="author-meta">
                <div class="author-name">{{ authorName }}</div>
                <div class="author-sub">{{ formattedDate }} • {{ readingTime }} min</div>
              </div>
            </div>

            <h1 v-if="!isEditingPost" class="post-title">{{ post.title }}</h1>

            <div v-else class="edit-fields">
              <input v-model="editTitle" class="edit-title" placeholder="Title" maxlength="120" />
            </div>
          </header>

          <div class="post-divider"></div>

          <article v-if="!isEditingPost" class="post-body">
            <p class="post-paragraph" v-for="(p, idx) in (post.content || '').split('\n')" :key="idx">
              {{ p }}
            </p>
          </article>

          <div v-else class="edit-fields">
            <textarea v-model="editContent" class="edit-content" placeholder="Write your content..." rows="10"></textarea>
            <div class="edit-actions">
              <button class="action-btn" type="button" :disabled="saving" @click="savePost">
                {{ saving ? "Saving..." : "Save" }}
              </button>
              <button class="action-btn subtle" type="button" :disabled="saving" @click="cancelEditPost">
                Cancel
              </button>
            </div>
          </div>

          <!-- Comments -->
          <div class="comments-divider"></div>

          <section class="comments">
            <div class="comments-header">
              <h2 class="comments-title">Comments</h2>
              <span class="comments-count">{{ comments.length }}</span>
            </div>

            <!-- Comment form (other logged-in users only) -->
            <div v-if="canComment" class="comment-form glass-card glass-card--wide">
              <textarea v-model="newComment" class="comment-input" placeholder="Write a comment..." rows="3"></textarea>
              <div class="comment-actions">
                <button class="action-btn" type="button" :disabled="commentLoading || !newComment.trim()" @click="submitComment">
                  {{ commentLoading ? "Posting..." : "Post comment" }}
                </button>
              </div>
            </div>

            <div v-else-if="!isAuthenticated" class="comment-hint">Log in to comment.</div>
            <div v-else class="comment-hint">You can’t comment on your own post.</div>

            <!-- List -->
            <div v-if="comments.length" class="comment-list">
              <div v-for="c in comments" :key="c._id" class="comment-item glass-car glass-card--wide">
                <div class="comment-top">
                  <div class="comment-avatar">
                    {{ (c.username || c.userId?.username || "A").charAt(0).toUpperCase() }}
                  </div>

                  <div class="comment-meta">
                    <div class="comment-author">{{ c.username || c.userId?.username || "Anonymous" }}</div>
                    <div class="comment-date">{{ formatCommentDate(c.createdAt || c.updatedAt) }}</div>
                  </div>

                  <!-- comment actions -->
                  <div class="comment-controls">
                    <button
                      v-if="editingCommentId !== c._id && canEditComment(c)"
                      class="mini-btn"
                      type="button"
                      :disabled="commentLoading"
                      @click="startEditComment(c)"
                    >
                      Edit
                    </button>

                    <button
                      v-if="canDeleteComment(c)"
                      class="mini-btn danger"
                      type="button"
                      :disabled="commentLoading"
                      @click="deleteComment(c._id)"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <!-- comment body / edit -->
                <p v-if="editingCommentId !== c._id" class="comment-text">{{ c.text }}</p>

                <div v-else class="comment-edit">
                  <textarea v-model="editCommentText" class="comment-input" rows="3"></textarea>
                  <div class="comment-actions">
                    <button class="action-btn" type="button" :disabled="commentLoading" @click="saveComment(c._id)">
                      Save
                    </button>
                    <button class="action-btn subtle" type="button" :disabled="commentLoading" @click="cancelEditComment">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="comment-empty">No comments yet.</div>
          </section>
        </section>
      </main>

      <!-- Toast -->
      <Transition name="fade-slide">
        <div v-if="error" class="error-toast">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{{ error }}</p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
/* Uses the same liquid-glass style language as your app */
:root {
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --glass-border: rgba(255, 255, 255, 0.08);
  --shadow-soft: 0 10px 30px -10px rgba(0,0,0,0.1);
}

.post-page {
  font-family: "DM Sans", system-ui, sans-serif;
  min-height: 100vh;
  background-color: var(--bg);
  color: var(--text-primary);
  transition: var(--transition-smooth);
  padding-bottom: 4rem;
}

.post-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
}

.post-nav {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg);
}

.post-back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  font-weight: 800;
  font-size: 0.95rem;
  padding: 8px 12px;
  border-radius: 12px;
  transition: var(--transition-smooth);
}
.post-back-btn:hover {
  background: rgba(128, 128, 128, 0.1);
  color: var(--text-primary);
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.post-meta-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  background: rgba(128, 128, 128, 0.06);
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 700;
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: var(--glass-border);
}

.action-btn {
  background: rgba(128, 128, 128, 0.08);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 900;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition-smooth);
}
.action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.05);
}
.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.action-btn.danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.18);
  color: #ef4444;
}
.action-btn.subtle { opacity: 0.85; }

.post-surface {
  background: var(--glass-bg, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: clamp(1.5rem, 3vw, 4rem);
  box-shadow: var(--shadow-soft);
  min-height: 70vh;
  width: 100%;
  margin: 2rem 0;
  box-sizing: border-box;
}

.author-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.author-avatar {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: rgba(128, 128, 128, 0.14);
  border: 1px solid var(--glass-border);
  display: grid;
  place-items: center;
  font-weight: 900;
}
.author-meta { display: flex; flex-direction: column; gap: 2px; }
.author-name { font-weight: 900; }
.author-sub { color: var(--text-secondary); font-weight: 700; font-size: 0.9rem; }

.post-title {
  font-family: "DM Sans", serif;
  font-size: clamp(2rem, 5vw, 3.25rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0;
}

.post-divider {
  width: 100px;
  height: 2px;
  background: var(--text-primary);
  opacity: 0.1;
  border-radius: 2px;
  margin: 2.25rem 0;
}

.post-body { font-size: 1.1rem; line-height: 1.9; }
.post-paragraph { margin: 0 0 1.1rem 0; white-space: pre-wrap; }

/* edit */
.edit-fields { display: flex; flex-direction: column; gap: 12px; }
.edit-title, .edit-content, .comment-input {
  width: 100%;
  background: rgba(128, 128, 128, 0.06);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  color: var(--text-primary);
  outline: none;
  padding: 12px 14px;
  font-size: 1rem;
}
.edit-title { font-weight: 800; }
.edit-actions { display: flex; gap: 10px; }

/* comments */
.comments-divider {
  width: 100%;
  height: 1px;
  background: var(--glass-border);
  margin: 2.5rem 0 1.25rem;
}
.comments-header { display: flex; align-items: center; gap: 10px; margin-bottom: 1rem; }
.comments-title { margin: 0; font-size: 1rem; font-weight: 900; }
.comments-count {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--text-secondary);
  background: rgba(128, 128, 128, 0.08);
  border: 1px solid var(--glass-border);
  border-radius: 9999px;
  padding: 2px 9px;
}
.comment-form { padding: 14px; border-radius: 18px; margin-bottom: 14px; }
.comment-actions { display: flex; justify-content: flex-end; margin-top: 10px; }
.comment-hint { color: var(--text-secondary); font-weight: 700; padding: 8px 0 14px; }

.comment-list { display: flex; flex-direction: column; gap: 12px; }
.comment-item { padding: 14px; border-radius: 18px; }
.comment-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.comment-avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: rgba(128, 128, 128, 0.14);
  border: 1px solid var(--glass-border);
  display: grid;
  place-items: center;
  font-weight: 900;
}

.comment-form,
.comment-item {
  padding: 1.5rem !important;
}
.comment-meta { flex: 1; min-width: 0; }
.comment-author { font-weight: 900; }
.comment-date { color: var(--text-secondary); font-weight: 700; font-size: 0.85rem; }
.comment-text { margin: 0; line-height: 1.7; }
.comment-empty { color: var(--text-secondary); font-weight: 700; padding: 8px 0; }

.comment-controls { display: flex; gap: 8px; }
.mini-btn {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  padding: 6px 10px;
  border-radius: 10px;
  font-weight: 900;
  font-size: 0.8rem;
  cursor: pointer;
  transition: var(--transition-smooth);
}
.mini-btn:hover:not(:disabled) { filter: brightness(1.08); }
.mini-btn.danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.18);
  color: #ef4444;
}

/* skeleton / empty / toast */
.skeleton { display: flex; flex-direction: column; gap: 14px; }
.sk-title { height: 54px; border-radius: 14px; background: rgba(128, 128, 128, 0.12); }
.sk-line { height: 18px; border-radius: 10px; background: rgba(128, 128, 128, 0.1); }
.sk-line.short { width: 70%; }

.empty-state { text-align: center; padding: 2rem 0; }
.primary {
  background: var(--text-primary);
  color: var(--bg);
  border: none;
  padding: 12px 18px;
  border-radius: 14px;
  font-weight: 900;
  cursor: pointer;
}

.error-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #fee2e2;
  color: #991b1b;
  padding: 12px 20px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #fecaca;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 100;
}
.error-toast p { margin: 0; font-size: 0.9rem; font-weight: 800; }

.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translate(-50%, 20px); }

@media (max-width: 640px) {
  .post-inner { padding: 0 1rem; }
  .post-surface {
    padding: 1.5rem;
    border-radius: 16px;
    border: none;
    background: transparent;
    box-shadow: none;
  }
  .post-nav { height: 64px; }
  .post-meta-pill { display: none; }
}
</style>