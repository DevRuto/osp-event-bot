<script setup>
import { ref, onMounted, computed } from 'vue'
import PieChart from '@/components/PieChart.vue'
import { getTeamColor } from '@/utils/colors.js'

const players = ref([])
const loading = ref(true)

const sortedPlayers = computed(() =>
  [...players.value].sort((a, b) => b.submissionTotal - a.submissionTotal),
)

onMounted(async () => {
  try {
    loading.value = true
    const res = await fetch('/api/leaderboard/teams')
    if (!res.ok) throw new Error('Failed to load players data')
    const teams = await res.json()
    for (const team of teams) {
      for (const player of team.members) {
        players.value.push({
          ...player,
          teamName: team.name,
        })
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
})

const formatGP = (value) => {
  return new Intl.NumberFormat().format(value) + ' GP'
}
</script>

<template>
  <div
    class="max-w-7xl mx-auto p-6 mt-10 text-black dark:text-white transition-colors duration-300"
  >
    <h1 class="text-3xl font-bold text-center mb-8">Player Breakdowns</h1>
    <div v-if="loading" class="text-center">Loading...</div>
    <div v-else>
      <PieChart
        :labels="sortedPlayers.map((p) => p.rsn)"
        :data="sortedPlayers.map((p) => p.submissionTotal)"
        :height="800"
      />

      <div class="space-y-4">
        <div
          v-for="member in sortedPlayers"
          :key="member.id"
          class="flex items-center border border-gray-200 dark:border-gray-700 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
          :style="{ borderLeft: `6px solid ${getTeamColor(member.teamName)}` }"
        >
          <!-- Avatar -->
          <img
            :src="member.avatar"
            alt="Avatar"
            class="w-12 h-12 rounded-full border dark:border-gray-600 flex-shrink-0"
          />

          <!-- Info container -->
          <div class="flex flex-col ml-4 min-w-0">
            <div>
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full truncate"
                :style="{
                  backgroundColor: getTeamColor(member.teamName),
                  color: 'black',
                }"
              >
                {{ member.teamName }}
              </span>
            </div>
            <p class="font-semibold truncate">{{ member.rsn }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
              Discord: {{ member.username }}
            </p>
            <p v-if="member.duo" class="text-sm text-gray-500 dark:text-gray-400 truncate">
              Duo: {{ member.duo }}
            </p>
            <span class="font-medium text-green-700 dark:text-green-400 truncate">
              {{ formatGP(member.submissionTotal) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
