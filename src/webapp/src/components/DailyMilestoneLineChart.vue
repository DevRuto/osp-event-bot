<script setup>
import { computed } from 'vue'
import LineChart from '@/components/LineChart.vue'
import { getTeamColor } from '@/utils/colors.js'

const props = defineProps({
  dayData: Object, // expects an object with a 'teams' array and 'day' index
})

// Generate the chart data for the day
const chart = computed(() => {
  const datasets = []
  const hourCount = 24
  const labels = Array.from({ length: hourCount }, (_, i) => `Hour ${i}`)

  for (const team of props.dayData.teams) {
    let cumulative = 0
    const cumulativeData = team.hourlyBreakdown.map((value) => {
      cumulative += value
      return cumulative
    })

    datasets.push({
      label: team.teamName,
      data: cumulativeData,
      borderColor: getTeamColor(team.teamName),
      backgroundColor: 'transparent',
      tension: 0.3,
    })
  }

  return {
    datasets,
    labels,
  }
})
</script>

<template>
  <div class="mb-10">
    <h2 class="text-xl font-semibold mb-2">Day {{ dayData.day + 1 }}</h2>
    <LineChart :datasets="chart.datasets" :labels="chart.labels" />
  </div>
</template>
