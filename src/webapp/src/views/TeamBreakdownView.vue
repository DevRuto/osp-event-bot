<script setup>
import { ref, onMounted, computed } from 'vue'
import PieChart from '@/components/PieChart.vue'

const teams = ref([])
const loading = ref(true)
const activeTab = ref(0)

const currentTeam = computed(() => teams.value[activeTab.value] || { members: [] })

const sortedMembers = computed(() =>
  [...(currentTeam.value.members || [])].sort((a, b) => b.submissionTotal - a.submissionTotal),
)

onMounted(async () => {
  try {
    loading.value = true
    const res = await fetch('/api/leaderboard/teams')
    if (!res.ok) throw new Error('Failed to load players data')
    teams.value = (await res.json()).sort((a, b) => b.teamTotal - a.teamTotal)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
})

const formatGP = (value) => {
  return new Intl.NumberFormat().format(value) + ' GP'
}
</script>

<template>
  <div
    class="max-w-7xl mx-auto p-6 mt-10 text-black dark:text-white transition-colors duration-300"
  >
    <h1 class="text-3xl font-bold text-center mb-8">Team Breakdowns</h1>
    <div v-if="loading" class="text-center">Loading...</div>
    <div v-else>
      <div class="flex space-x-2 border-b border-gray-300 dark:border-gray-700 overflow-x-auto">
        <button
          v-for="(team, index) in teams"
          :key="team.id"
          @click="activeTab = index"
          :class="[
            'px-4 py-2 font-medium whitespace-nowrap',
            activeTab === index
              ? 'border-b-4 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
          ]"
        >
          {{ team.name }}
        </button>
      </div>

      <div v-if="teams.length > 0" class="mt-6">
        <div class="bg-white dark:bg-gray-900 shadow-md dark:shadow-none rounded-lg p-4">
          <h2 class="text-xl font-semibold mb-4">
            {{ currentTeam.name }} — Total: {{ formatGP(currentTeam.teamTotal) }}
          </h2>

          <!-- Pie Chart -->
          <div class="mb-6">
            <PieChart
              :labels="sortedMembers.map((p) => p.rsn)"
              :data="sortedMembers.map((p) => p.submissionTotal)"
              :height="400"
            />
          </div>

          <!-- Member Cards -->
          <div class="space-y-4">
            <div
              v-for="member in sortedMembers"
              :key="member.id"
              class="flex items-center gap-4 border border-gray-200 dark:border-gray-700 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <img
                :src="member.avatar"
                alt="Avatar"
                class="w-12 h-12 rounded-full border dark:border-gray-600"
              />
              <div>
                <p class="font-semibold">{{ member.rsn }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Discord: {{ member.username }}
                </p>
                <p v-if="member.duo" class="text-sm text-gray-500 dark:text-gray-400">
                  Duo: {{ member.duo }}
                </p>
                <div class="ml-auto font-medium text-green-700 dark:text-green-400">
                  {{ formatGP(member.submissionTotal) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
