<script setup>
import { defineProps } from 'vue'

defineProps({
  topEarners: {
    type: Array,
    required: true,
  },
  getTeamName: {
    type: Function,
    required: true,
  },
})

function formatNumber(value) {
  return value.toLocaleString()
}
</script>

<template>
  <ol class="space-y-3">
    <li
      v-for="(player, index) in topEarners"
      :key="player.id"
      class="text-sm text-gray-800 dark:text-gray-200"
    >
      <div class="flex items-center justify-between">
        <div class="flex min-w-[3rem] flex-col text-blue-800 dark:text-blue-300">
          <div class="flex items-baseline font-bold">
            <span class="mr-1">{{ index + 1 }}.</span>
            <span>{{ player.rsn.split(',')[0].trim() }}</span>
          </div>
          <div>
            <span
              v-for="(part, i) in player.rsn.split(',').slice(1)"
              :key="i"
              class="block break-words ml-[1rem]"
            >
              {{ part.trim() }}
            </span>
          </div>
          <div
            v-if="player.discriminator && player.discriminator !== '0'"
            class="text-gray-500 dark:text-gray-400 font-normal ml-[1.6rem]"
          >
            #{{ player.discriminator }}
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400 italic ml-[1.6rem]">
            {{ getTeamName(player.id) }}
          </div>
        </div>
        <div class="font-semibold text-green-600 dark:text-green-400 text-sm whitespace-nowrap">
          {{ formatNumber(player.submissionTotal) }} GP
        </div>
      </div>
    </li>
  </ol>
</template>
