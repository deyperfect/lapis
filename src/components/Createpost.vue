<script setup>
import { ref, onMounted, watch } from "vue";
import { usePostsStore } from "../stores/posts";
import { useRouter } from "vue-router";
import { useTheme } from "../components/Usetheme";

const posts = usePostsStore();
const router = useRouter();
const { theme } = useTheme();

const title = ref("");
const content = ref("");
const bodyTextarea = ref(null);

// Auto-resize textarea
const adjustHeight = () => {
  if (bodyTextarea.value) {
    bodyTextarea.value.style.height = "auto";
    bodyTextarea.value.style.height = bodyTextarea.value.scrollHeight + "px";
  }
};

watch(content, () => {
  adjustHeight();
});

const submit = async () => {
  if (!title.value.trim() || !content.value.trim()) return;

  try {
    const post = await posts.createPost({
      title: title.value.trim(),
      content: content.value.trim(),
    });

    router.push({ name: "home" });
  } catch (err) {
    console.error("Failed to publish:", err?.response?.data || err);
  }
};

onMounted(() => {
  const titleInput = document.querySelector(".create-title-input");
  if (titleInput) titleInput.focus();
  adjustHeight();
});
</script>

<template>
  <div class="create-page" :class="theme">
    <div class="create-inner">
      <!-- Top Navigation Bar -->
      <nav class="create-nav">
        <RouterLink to="/" class="create-back-btn" title="Discard and go back">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </RouterLink>

        <div class="create-actions">
          <div class="create-status-group">
            <span
              class="char-badge"
              :class="{
                'char-limit-near': title.length > 100,
                'char-limit-exceeded': title.length >= 120,
              }"
            >
              {{ title.length }}/120
            </span>
            <div class="vertical-divider"></div>
            <span class="reading-time">
              {{ Math.ceil(content.split(/\s+/).filter(Boolean).length / 200) }} min read
            </span>
          </div>

          <button
            class="publish-btn"
            @click="submit"
            :disabled="posts.loading || !title.trim() || !content.trim()"
          >
            <span v-if="posts.loading" class="spinner"></span>
            <span>{{ posts.loading ? "Publishing" : "Publish" }}</span>
          </button>
        </div>
      </nav>

      <main class="editor-surface glass-card">
        <!-- Title Input Section -->
        <header class="editor-header">
          <input
            v-model="title"
            class="create-title-input"
            placeholder="Untitled Story"
            maxlength="120"
            spellcheck="false"
          />
        </header>

        <div class="editor-divider"></div>

        <!-- Content Input Section -->
        <div class="editor-body">
          <textarea
            ref="bodyTextarea"
            v-model="content"
            class="create-body-input"
            placeholder="Begin your narrative..."
            @input="adjustHeight"
          ></textarea>
        </div>
      </main>

      <!-- Error Notification -->
      <Transition name="fade-slide">
        <div v-if="posts.error" class="error-toast">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{{ posts.error }}</p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
/* Design System Variables */
:root {
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --glass-border: rgba(255, 255, 255, 0.08);
  --shadow-soft: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
}

.create-page {
  font-family: "DM Sans", system-ui, sans-serif;
  min-height: 100vh;
  background-color: var(--bg);
  color: var(--text-primary);
  transition: var(--transition-smooth);
  padding-bottom: 4rem;
}

.create-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
}

/* ── Navigation ── */
.create-nav {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg);
}

.create-back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 8px 12px;
  border-radius: 12px;
  transition: var(--transition-smooth);
}

.create-back-btn:hover {
  background: rgba(128, 128, 128, 0.1);
  color: var(--text-primary);
}

.create-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.create-status-group {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.char-badge {
  padding: 4px 8px;
  background: rgba(128, 128, 128, 0.08);
  border-radius: 6px;
  font-variant-numeric: tabular-nums;
}

.char-limit-near {
  color: #f59e0b;
}
.char-limit-exceeded {
  color: #ef4444;
}

.vertical-divider {
  width: 1px;
  height: 16px;
  background: var(--glass-border);
}

.publish-btn {
  background: var(--text-primary);
  color: var(--bg);
  border: none;
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: var(--transition-smooth);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.publish-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.1);
}

.publish-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  filter: grayscale(1);
}

/* ── Editor Surface ── */
.editor-surface {
  background: var(--glass-bg, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 4rem;
  box-shadow: var(--shadow-soft);
  min-height: 70vh;

  /* Full-width inside container */
  width: 100%;
  max-width: 100%;
  margin: 2rem 0;
  box-sizing: border-box;
}

.editor-header {
  margin-bottom: 2rem;
}

.create-title-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-family: "DM Serif Display", serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  color: var(--text-primary);
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.create-title-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.2;
}

.editor-divider {
  width: 100px;
  height: 2px;
  background: var(--text-primary);
  opacity: 0.1;
  border-radius: 2px;
  margin: 3rem 0;
}

.editor-body {
  position: relative;
  margin-top: 1rem;
}

.create-body-input {
  width: 100%;
  min-height: 400px;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1.25rem;
  line-height: 1.8;
  color: var(--text-primary);
  resize: none;
  overflow: hidden;
  font-family: "DM Sans", sans-serif;
}

.create-body-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.3;
}

/* ── Error Toast ── */
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

.error-toast p {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}

/* ── Utilities & Animations ── */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}

/* ── Mobile Adjustments ── */
@media (max-width: 640px) {
  .create-inner {
    padding: 0 1rem;
  }

  .editor-surface {
    padding: 1.5rem;
    border-radius: 16px;
    border: none;
    background: transparent;
    box-shadow: none;
  }

  .create-nav {
    height: 64px;
  }

  .create-status-group {
    display: none;
  }

  .create-title-input {
    font-size: 2.25rem;
  }

  .editor-divider {
    margin: 2rem 0;
  }
}
</style>