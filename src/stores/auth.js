import { defineStore } from "pinia";
import * as authApi from "../api/auth";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || null,
    user: JSON.parse(localStorage.getItem(USER_KEY) || "null"),
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (s) => !!s.token,
  },

  actions: {
    async login(payload) {
      this.loading = true;
      this.error = null;

      try {
        const res = await authApi.login(payload);

        // Your backend shape: { success: true, data: { token: "..." } }
        this.token = res?.data?.data?.token || null;

        if (!this.token) {
          throw new Error("Login succeeded but token was missing in the response.");
        }

        localStorage.setItem(TOKEN_KEY, this.token);
      } catch (err) {
        this.error =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Login failed.";
        throw err;
      } finally {
        this.loading = false;
      }

      // fetchMe failure should never block login
      try {
        await this.fetchMe();
      } catch {}
    },

    async register(payload) {
      this.loading = true;
      this.error = null;

      try {
        const res = await authApi.register(payload);

        this.token = res?.data?.data?.token || null;

        if (!this.token) {
          throw new Error("Registration succeeded but token was missing in the response.");
        }

        localStorage.setItem(TOKEN_KEY, this.token);
      } catch (err) {
        this.error =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Registration failed.";
        throw err;
      } finally {
        this.loading = false;
      }

      // fetchMe failure should never block register
      try {
        await this.fetchMe();
      } catch {}
    },

async fetchMe() {
  if (!this.token) return;

  const res = await authApi.profile();

  const user =
    res?.data?.data ||      
    res?.data?.user ||    
    res?.data ||     
    null;

  this.user = user;

  if (user) {
    localStorage.setItem("auth_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("auth_user");
  }
},

    logout() {
      this.token = null;
      this.user = null;
      this.loading = false;
      this.error = null;

      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
  },
});