<script setup>
import OverallMilestoneLineChart from '@/components/OverallMilestoneLineChart.vue'
import DailyMilestoneLineChart from '@/components/DailyMilestoneLineChart.vue'
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const milestones = ref([])
const loading = ref(true)
const error = ref(null)
const activeDayIndex = ref(0)

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
  } catch (err) {
    console.error(err)
    error.value = 'Failed to load milestones data.'
  } finally {
    loading.value = false
  }
})

function createDayString(day) {
  const eventStart = new Date('2025-05-16T16:00:00Z') // 12 PM EST on May 16 (adjust if needed)
  const currentDayDate = new Date(eventStart)
  currentDayDate.setUTCDate(currentDayDate.getUTCDate() + day)
  const weekday = currentDayDate.toLocaleDateString(undefined, { weekday: 'long' })
  const monthDay = currentDayDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
  return `Day ${day + 1} – ${weekday}, ${monthDay}`
}

const activeDay = computed(() => milestones.value[activeDayIndex.value])
</script>

<template>
  <div v-if="loading" class="text-center">Loading...</div>
  <div v-else-if="error" class="text-red-500 text-center">{{ error }}</div>
  <div v-else>
    <h1 class="text-3xl font-bold mb-6 text-center">Team Progression Graphs</h1>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4 text-center text-purple-700 dark:text-purple-400">
        Overall Hourly Progression
      </h2>
      <OverallMilestoneLineChart :milestones="milestones" />
    </section>

    <section>
      <h2 class="text-xl font-bold mb-4 text-center">Daily Team Breakdown</h2>

      <!-- Tabs -->
      <div class="flex flex-wrap justify-center gap-2 mb-6">
        <button
          v-for="(day, index) in milestones"
          :key="day.day"
          @click="activeDayIndex = index"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeDayIndex === index
              ? 'bg-blue-600 text-white shadow'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300',
          ]"
        >
          {{ createDayString(day.day) }}
        </button>
      </div>

      <!-- Active Chart -->
      <div class="h-[400px]">
        <DailyMilestoneLineChart v-if="activeDay" :dayData="activeDay" />
      </div>
    </section>
  </div>
</template>
