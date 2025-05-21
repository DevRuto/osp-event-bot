<script setup>
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps({
  labels: Array,
  data: Array,
})

const chartReady = computed(() => {
  return props.labels?.length && props.data?.length
})

// Manual color assignment for each team
const teamColorsMap = {
  'Team Apple': '#E53935',
  'Team Orange': '#FF9800',
  'Team Pear': '#8BC34A',
  'Team Lemon': '#FFEB3B',
}

function getColorForTeam(teamName) {
  return teamColorsMap[teamName] || '#888'
}

const chartData = {
  labels: props.labels,
  datasets: [
    {
      label: 'GP',
      data: props.data,
      backgroundColor: props.labels.map(getColorForTeam),
      borderWidth: 1,
    },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    },
  },
}

// Theme stuff
const isDark = ref(document.documentElement.classList.contains('dark'))
const pieChartRef = ref(null)

function updateChartColors() {
  if (pieChartRef.value?.chart) {
    const chart = pieChartRef.value.chart
    chart.options.plugins.legend.labels.color = isDark.value ? '#ffffff' : '#333333'
    chart.options.plugins.tooltip.bodyColor = isDark.value ? '#ffffff' : '#333333'
    chart.options.plugins.tooltip.titleColor = isDark.value ? '#ffffff' : '#333333'
    chart.update()
  }
}

onMounted(() => {
  // Watch for dark mode class change
  const observer = new MutationObserver(() => {
    const darkMode = document.documentElement.classList.contains('dark')
    if (isDark.value !== darkMode) {
      isDark.value = darkMode
    }
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

  window.__darkModeObserver = observer

  nextTick(() => {
    updateChartColors()
  })
})

// Update chart colors when dark mode changes
watch(isDark, () => {
  updateChartColors()
})

onBeforeUnmount(() => {
  window.__darkModeObserver?.disconnect()
})
</script>

<template>
  <div v-if="chartReady">
    <Pie :data="chartData" :options="chartOptions" ref="pieChartRef" />
  </div>
</template>
