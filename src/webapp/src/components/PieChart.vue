<script setup>
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'
import { getTeamColor } from '@/utils/colors.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps({
  labels: Array,
  data: Array,
  height: {
    type: Number,
    required: false,
  },
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
      onHover: (event, legendItem, legend) => {
        const chart = legend.chart
        const datasetIndex = legendItem.datasetIndex || 0
        const index = legendItem.index

        chart.setActiveElements([{ datasetIndex, index }])
        chart.tooltip.setActiveElements([{ datasetIndex, index }], { x: 0, y: 0 })
        chart.data.datasets[0].backgroundColor.forEach((color, index, colors) => {
          colors[index] = index === legendItem.index || color.length === 9 ? color : color + '4D'
        })
        chart.update()
      },
      onLeave: (event, legendItem, legend) => {
        const chart = legend.chart
        chart.setActiveElements([])
        chart.tooltip.setActiveElements([], { x: 0, y: 0 })
        chart.data.datasets[0].backgroundColor.forEach((color, index, colors) => {
          colors[index] = color.length === 9 ? color.slice(0, -2) : color
        })
        chart.update()
      },
    },
    datalabels: {
      color: '#000',
      formatter: (value, context) => {
        const data = context.chart.data.datasets[0].data
        const total = data.reduce((a, b) => a + b, 0)
        const percentage = ((value / total) * 100).toFixed(1)
        return `${percentage}%`
      },
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const label = context.label || ''
          const value = context.parsed
          const total = context.chart._metasets[0].total
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${value.toLocaleString()} GP (${percentage}%)`
        },
      },
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
  <div v-if="chartReady" :class="[height ? `h-[${height}px]` : '']">
    <Pie :data="chartData" :options="chartOptions" ref="pieChartRef" :plugins="[ChartDataLabels]" />
  </div>
</template>
