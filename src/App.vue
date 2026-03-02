<script setup>
import { useAuthStore } from './stores/auth'
import { useTheme } from './components/Usetheme'
import { onMounted } from "vue";

import Navbar from "./components/Navbar.vue";

const auth = useAuthStore()
const { theme, toggleTheme } = useTheme()

onMounted(() => {
  if (auth.token) auth.fetchMe();
});
</script>

<template>
  <main>
    <router-view />
  </main>
  <Navbar :theme="theme" @toggle-theme="toggleTheme" />
</template>