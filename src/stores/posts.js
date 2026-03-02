import { defineStore } from "pinia";
import * as postsApi from "../api/posts";

export const usePostsStore = defineStore("posts", {
  state: () => ({
    posts: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
  }),

  actions: {
    async fetchPosts(page = 1, limit = 10) {
    this.loading = true;
    this.error = null;
    this.currentPage = 1;   // ← reset before fetch
    this.totalPages = 1;    // ← reset before fetch
    try {
      const res = await postsApi.getPosts({ page, limit });
      const data = res.data;
      this.posts = data.data || [];
      this.currentPage = data.currentPage;  // will be 1
      this.totalPages = data.totalPages;    // will be 2
    } catch (err) {
      this.error = err?.response?.data?.message || "Failed to load posts.";
    } finally {
      this.loading = false;
    }
  },

    async createPost(payload) {
      const res = await postsApi.createPost(payload);
      const created = res.data.data;
      this.posts.unshift(created);
      return created;
    },

    async deletePost(postId) {
      await postsApi.deletePost(postId);
      this.posts = this.posts.filter((p) => p._id !== postId);
    },
  },
});