<script setup>
import { defineProps } from 'vue'

defineProps({
  team: {
    type: Object,
    required: true,
  },
})

function formatNumber(value) {
  return value.toLocaleString()
}
</script>

<template>
  <h2 class="text-2xl font-semibold mb-3 text-blue-700 dark:text-blue-400">
    {{ team.name }}
  </h2>
  <div class="text-gray-700 dark:text-gray-300 mb-4">
    Team Total:
    <span class="font-bold text-green-600 dark:text-green-400">
      {{ formatNumber(team.teamTotal) }} GP
    </span>
  </div>

  <ul class="space-y-2">
    <li v-for="member in team.members" :key="member.id" class="flex items-center gap-3">
      <img
        v-if="member.avatar"
        :src="member.avatar"
        alt="avatar"
        class="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600"
      />
      <div
        v-else
        class="w-10 h-10 flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-lg font-bold rounded-full"
      >
        {{ member.rsn.charAt(0).toUpperCase() }}
      </div>
      <div class="flex-1">
        <div class="font-semibold text-lg text-blue-800 dark:text-blue-300">
          {{ member.rsn
          }}<span
            v-if="member.discriminator && member.discriminator !== '0'"
            class="text-gray-500 dark:text-gray-400"
            >#{{ member.discriminator }}</span
          >
        </div>
        <div
          class="mt-1 inline-block px-2 py-1 text-sm font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900 rounded-md"
        >
          {{ formatNumber(member.submissionTotal) }} GP
        </div>
      </div>
    </li>
  </ul>
</template>
