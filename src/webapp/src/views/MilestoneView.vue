<script setup>
import PieChart from '@/components/PieChart.vue'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import DayMilestone from '@/components/DayMilestone.vue'

const milestones = ref([])
const loading = ref(true)
const error = ref(null)
const totalGPOverall = ref(0)

// Compute pie data for entire event
const overallPieLabels = ref([])
const overallPieData = ref([])

function formatNumber(value) {
  return value.toLocaleString()
}

function getEventDayTimeWindowForUser() {
  const eventStartUTC = new Date(Date.UTC(2025, 4, 16, 16)) // May 16, 12PM EST = 16:00 UTC
  const eventEndUTC = new Date(eventStartUTC.getTime() + 24 * 60 * 60 * 1000)

  const startLocal = eventStartUTC.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
  const endLocal = eventEndUTC.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  return `${startLocal} – ${endLocal} (your local time)`
}

const eventDayWindow = getEventDayTimeWindowForUser()

onMounted(async () => {
  try {
    loading.value = true
    const res = await axios.get('/api/milestones')
    // Sort each day's teams by cumulativeTotal descending
    milestones.value = res.data.milestones.map((day) => {
      return {
        ...day,
        teams: day.teams.slice().sort((a, b) => b.dailyTotal - a.dailyTotal),
      }
    })

    // Calculate total GP overall from milestones data
    if (milestones.value.length > 0) {
      const teamTotals = new Map()

      for (const day of milestones.value) {
        for (const team of day.teams) {
          const existing = teamTotals.get(team.teamId) || {
            name: team.teamName,
            cumulative: 0,
          }
          teamTotals.set(team.teamId, {
            name: team.teamName,
            cumulative: Math.max(existing.cumulative, team.cumulativeTotal),
          })
        }
      }

      const sortedTotals = Array.from(teamTotals.values()).sort(
        (a, b) => b.cumulative - a.cumulative,
      )

      overallPieLabels.value = sortedTotals.map((t) => t.name)
      overallPieData.value = sortedTotals.map((t) => t.cumulative)
      totalGPOverall.value = sortedTotals.reduce((sum, t) => sum + t.cumulative, 0)
    } else {
      totalGPOverall.value = 0
    }
  } catch (err) {
    console.error(err)
    error.value = 'Failed to load milestones data.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-5xl mx-auto p-6 mt-10 text-gray-900 dark:text-gray-100">
    <h1 class="text-4xl font-bold mb-8 text-center">Event Milestones</h1>
    <p class="text-center text-gray-600 dark:text-gray-400 text-sm mb-6">
      Each event day runs from <span class="font-medium">{{ eventDayWindow }}</span>
    </p>

    <div class="text-center text-xl font-semibold mb-6">
      Total GP Overall:
      <span class="text-green-700 dark:text-green-400 font-mono">
        {{ formatNumber(totalGPOverall) }} GP
      </span>
    </div>

    <div class="mb-12" v-if="!loading && overallPieLabels.length && overallPieData.length">
      <h2 class="text-2xl font-bold text-center mb-4">GP Share by Team (Total Event)</h2>
      <div class="w-72 h-72 mx-auto">
        <!-- 18rem = 288px -->
        <PieChart :labels="overallPieLabels" :data="overallPieData" />
      </div>
    </div>

    <div v-if="loading" class="text-center text-xl">Loading milestones...</div>
    <div v-else-if="error" class="text-center text-red-600">{{ error }}</div>
    <div v-else>
      <div
        v-for="dayData in milestones"
        :key="dayData.day"
        class="mb-10 p-6 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md bg-white dark:bg-gray-800"
      >
        <DayMilestone :day-milestone="dayData" />
      </div>
    </div>
  </div>
</template>
