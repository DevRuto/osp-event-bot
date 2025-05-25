<script setup>
import PieChart from '@/components/PieChart.vue'

defineProps({
  dayMilestone: {
    type: Object,
    required: true,
  },
})

function formatNumber(value) {
  return value.toLocaleString()
}

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
</script>

<template>
  <h2 class="text-2xl font-semibold mb-4 text-center">
    {{ createDayString(dayMilestone.day) }}
  </h2>

  <div class="flex flex-col lg:flex-row gap-6">
    <!-- Left: Table -->
    <div class="flex-1">
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
            v-for="team in dayMilestone.teams"
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
              class="px-4 py-2 border-t border-gray-300 dark:border-gray-600 font-mono text-yellow-600 dark:text-yellow-400 font-bold"
            >
              {{ formatNumber(dayMilestone.dayTotal) }} GP
            </td>
            <td
              class="px-4 py-2 border-t border-gray-300 dark:border-gray-600 text-green-800 dark:text-green-400 font-mono"
            >
              {{ formatNumber(dayMilestone.cumulativeTotal) }} GP
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Right: Pie Chart -->
    <div class="w-full md:w-1/3 px-2">
      <PieChart
        :labels="dayMilestone.teams.map((t) => t.teamName)"
        :data="dayMilestone.teams.map((t) => t.dailyTotal)"
      />
    </div>
  </div>
</template>
