<template>
  <div>
    <nav class="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
      <div class="text-lg font-semibold">Ruto's Event</div>
      <div class="space-x-4">
        <RouterLink to="/" class="hover:text-gray-300">Home</RouterLink>
        <RouterLink to="/submit" class="hover:text-gray-300">Submit</RouterLink>
      </div>
    </nav>

    <main class="p-6">
      <router-view />
    </main>
  </div>
</template>
