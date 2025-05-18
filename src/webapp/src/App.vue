<script setup>
import { ref, onMounted } from 'vue'

const isDark = ref(false)

const applyTheme = (theme) => {
  isDark.value = theme === 'dark'
  document.documentElement.classList.toggle('dark', isDark.value)
}

const toggleDark = () => {
  const newTheme = isDark.value ? 'light' : 'dark'
  applyTheme(newTheme)
  localStorage.setItem('theme', newTheme)
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark' || saved === 'light') {
    applyTheme(saved)
  } else {
    // Follow system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    applyTheme(prefersDark ? 'dark' : 'light')
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <nav class="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
      <div class="text-lg font-semibold">Ruto's Domain</div>
      <div class="space-x-4">
        <RouterLink to="/" class="hover:text-gray-300">Home</RouterLink>
        <RouterLink to="/participants" class="hover:text-gray-300">Participants</RouterLink>
        <RouterLink to="/teams" class="hover:text-gray-300">Teams</RouterLink>
        <RouterLink to="/submit" class="hover:text-gray-300">Submit</RouterLink>

        <!-- Theme Toggle Button -->
        <button
          @click="toggleDark"
          class="ml-4 px-3 py-1 border border-white rounded hover:bg-gray-700 dark:border-gray-300 dark:hover:bg-gray-600"
        >
          {{ !isDark ? '☀️' : '🌙' }}
        </button>
      </div>
    </nav>

    <main
      class="flex-1 p-6 bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300"
    >
      <router-view />
    </main>
  </div>
</template>
