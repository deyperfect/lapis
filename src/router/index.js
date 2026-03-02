import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import HomePage from "../views/HomePage.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import CreatePostView from "../views/CreatePostView.vue";
import ProfileView from "../views/ProfileView.vue";
import PostDetailView from "../views/PostDetailView.vue";
import AdminDashboard from "../views/AdminDashboard.vue";

const routes = [
  { path: "/", name: "home", component: HomePage },
  { path: "/login", name: "login", component: LoginView },
  { path: "/register", name: "register", component: RegisterView },
  { path: "/create", name: "createPost", component: CreatePostView, meta: { requiresAuth: true } },
  { path: "/posts/:postId", name: "postDetail", component: PostDetailView }, 
  { path: "/profile", name: "profile", component: ProfileView, meta: { requiresAuth: true } },
  { path: "/admin", name: "admin", component: AdminDashboard, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  // Hydrate user on refresh if token exists — never logout on failure
  if (auth.token && !auth.user) {
    try {
      await auth.fetchMe();
    } catch {
      // fetchMe failed (e.g. network error) but token may still be valid
      // do NOT logout here — let the user stay logged in
    }
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: "login" };
  }
});

export default router;