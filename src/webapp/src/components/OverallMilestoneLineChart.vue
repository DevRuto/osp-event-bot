<script setup>
import LineChart from './LineChart.vue'
import { defineProps, computed } from 'vue'
import { getTeamColor } from '@/utils/colors.js'

const props = defineProps({
  milestones: Array,
})

function buildOverallHourlyDatasets(milestones) {
  const teamDataMap = new Map() // teamId => { label, data, color }

  let totalHours = 0

  for (const [, milestone] of milestones.entries()) {
    for (const team of milestone.teams) {
      if (!teamDataMap.has(team.teamId)) {
        teamDataMap.set(team.teamId, {
          label: team.teamName,
          data: [],
          borderColor: getTeamColor(team.teamName),
          backgroundColor: getTeamColor(team.teamName),
          tension: 0.3,
          _cumulative: 0, // track cumulative per team
        })
      }

      const entry = teamDataMap.get(team.teamId)

      for (const hourValue of team.hourlyBreakdown) {
        entry._cumulative += hourValue
        entry.data.push(entry._cumulative)
      }
    }

    totalHours += 24
  }

  return {
    datasets: Array.from(teamDataMap.values()).map(({ _, ...rest }) => rest),
    labels: Array.from({ length: totalHours }, (_, i) => `Hour ${i}`),
  }
}

const overallLineData = computed(() => buildOverallHourlyDatasets(props.milestones))
</script>

<template>
  <LineChart :datasets="overallLineData.datasets" :labels="overallLineData.labels" />
</template>
