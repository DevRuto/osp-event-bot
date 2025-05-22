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
import { ref, watch } from 'vue'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

const props = defineProps({
  datasets: Array, // [{ label: teamName, data: [...], borderColor: ..., ... }]
  labels: Array,
})

const chartRef = ref(null)

const chartData = {
  labels: props.labels,
  datasets: props.datasets,
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: '#ccc',
      },
    },
    x: {
      ticks: {
        color: '#ccc',
      },
    },
  },
  plugins: {
    legend: {
      labels: {
        color: '#ccc',
      },
    },
  },
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
</script>

<template>
  <div class="overflow-x-auto max-w-full">
    <div class="min-w-[800px] h-[400px]">
      <Line ref="chartRef" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
