<script setup>
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'
import { getTeamColor } from '@/utils/colors.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps({
  labels: Array,
  data: Array,
})

const chartReady = computed(() => {
  return props.labels?.length && props.data?.length
})

const chartData = {
  labels: props.labels,
  datasets: [
    {
      label: 'GP',
      data: props.data,
      backgroundColor: props.labels.map(getTeamColor),
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
