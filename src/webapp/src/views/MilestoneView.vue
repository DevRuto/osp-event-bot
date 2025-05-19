<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const milestones = ref([])
const loading = ref(true)
const error = ref(null)
const totalGPOverall = ref(0)

function formatNumber(value) {
  return value.toLocaleString()
}

onMounted(async () => {
  try {
    loading.value = true
    const res = await axios.get('/api/milestones')
    // Sort each day's teams by cumulativeTotal descending
    milestones.value = res.data.milestones.map((day) => {
      return {
        ...day,
        teams: day.teams.slice().sort((a, b) => b.cumulativeTotal - a.cumulativeTotal),
      }
    })

    // Calculate total GP overall from milestones data
    if (milestones.value.length > 0) {
      const lastDay = milestones.value[milestones.value.length - 1]
      // totalGPOverall = max cumulative total from the last day for all teams
      totalGPOverall.value = lastDay.cumulativeTotal
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

    <div class="text-center text-xl font-semibold mb-6">
      Total GP Overall:
      <span class="text-green-700 dark:text-green-400 font-mono">
        {{ formatNumber(totalGPOverall) }} GP
      </span>
    </div>
    <div class="text-center mb-8 italic text-gray-600 dark:text-gray-400">
      *Note: Current day is not included in the milestones data.*
    </div>

    <div v-if="loading" class="text-center text-xl">Loading milestones...</div>
    <div v-else-if="error" class="text-center text-red-600">{{ error }}</div>
    <div v-else>
      <div
        v-for="dayData in milestones"
        :key="dayData.day"
        class="mb-10 p-6 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md bg-white dark:bg-gray-800"
      >
        <h2 class="text-2xl font-semibold mb-4 text-center">
          {{
            new Date(dayData.day).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          }}
        </h2>

        <table class="w-full text-left table-auto border-collapse">
          <thead>
            <tr class="bg-gray-100 dark:bg-gray-700">
              <th class="px-4 py-2 border-b border-gray-300 dark:border-gray-600">Team</th>
              <th class="px-4 py-2 border-b border-gray-300 dark:border-gray-600">
                GP Earned That Day
              </th>
              <th class="px-4 py-2 border-b border-gray-300 dark:border-gray-600">Cumulative GP</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="team in dayData.teams"
              :key="team.teamId"
              class="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td class="px-4 py-2 border-b border-gray-200 dark:border-gray-600 font-semibold">
                {{ team.teamName }}
              </td>
              <td
                class="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-green-600 dark:text-green-400 font-mono"
              >
                {{ formatNumber(team.dailyTotal) }} GP
              </td>
              <td
                class="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-green-700 dark:text-green-300 font-mono font-semibold"
              >
                {{ formatNumber(team.cumulativeTotal) }} GP
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-gray-50 dark:bg-gray-700 font-bold">
              <td class="px-4 py-2 border-t border-gray-300 dark:border-gray-600">Day Total</td>
              <td
                class="px-4 py-2 border-t border-gray-300 dark:border-gray-600 text-green-700 dark:text-green-300 font-mono"
              >
                {{ formatNumber(dayData.dayTotal) }} GP
              </td>
              <td
                class="px-4 py-2 border-t border-gray-300 dark:border-gray-600 text-green-800 dark:text-green-400 font-mono"
              >
                {{ formatNumber(dayData.cumulativeTotal) }} GP
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>
