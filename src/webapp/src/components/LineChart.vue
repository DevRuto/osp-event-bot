<script setup>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

const props = defineProps({
  datasets: Array, // [{ label: teamName, data: [...], borderColor: ..., ... }]
  labels: Array,
})

const chartRef = ref(null)
const isDark = ref(document.documentElement.classList.contains('dark'))

const chartData = {
  labels: props.labels,
  datasets: props.datasets,
}

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: isDark.value ? '#ccc' : '#333',
      },
    },
    x: {
      ticks: {
        color: isDark.value ? '#ccc' : '#333',
      },
    },
  },
  plugins: {
    legend: {
      labels: {
        color: isDark.value ? '#ccc' : '#333',
        pointStyle: 'rectRounded', // Shape of the legend marker (filled rectangle with rounded corners)
        padding: 16,
      },
    },
  },
})

function updateChartThemeColors() {
  if (!chartRef.value?.chart) return

  const chart = chartRef.value.chart
  const themeColor = isDark.value ? '#ccc' : '#333'

  chart.options.scales.x.ticks.color = themeColor
  chart.options.scales.y.ticks.color = themeColor
  chart.options.plugins.legend.labels.color = themeColor

  chart.update()
}

watch(
  () => [props.labels, props.datasets],
  ([newLabels, newDatasets]) => {
    if (chartRef.value?.chart) {
      chartRef.value.chart.data.labels = newLabels
      chartRef.value.chart.data.datasets = newDatasets
      chartRef.value.chart.update()
    }
  },
  { deep: true },
)

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
    updateChartThemeColors()
  })
})

watch(isDark, () => {
  updateChartThemeColors()
})

onBeforeUnmount(() => {
  window.__darkModeObserver?.disconnect()
})
</script>

<template>
  <div class="overflow-x-auto max-w-full">
    <div class="min-w-[800px] h-[400px]">
      <Line ref="chartRef" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
