<script setup>
import { ref, onMounted } from 'vue'
import PieChart from '@/components/PieChart.vue'

const players = ref([])
const loading = ref(true)

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
</script>

<template>
  <div
    class="max-w-7xl mx-auto p-6 mt-10 text-black dark:text-white transition-colors duration-300"
  >
    <h1 class="text-3xl font-bold text-center mb-8">Player breakdowns</h1>
    <div v-if="loading" class="text-center">Loading...</div>
    <div v-else>
      <PieChart
        :labels="players.map((p) => p.rsn)"
        :data="players.map((p) => p.submissionTotal)"
        :height="800"
      />
    </div>
  </div>
</template>
