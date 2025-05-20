<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const teams = ref([])
const globalTotal = ref(0)
const event = ref({})
const now = ref(new Date())
const eventStartDate = computed(() => {
  return new Date(event.value.startDate)
})
const eventEndDate = computed(() => {
  return new Date(event.value.endDate)
})

setInterval(() => {
  now.value = new Date()
}, 1000) // update every minute

const currentDay = computed(() => {
  const msPerDay = 1000 * 60 * 60 * 24
  const diff = now.value.getTime() - eventStartDate.value.getTime()
  return Math.max(1, Math.floor(diff / msPerDay) + 1)
})

const timeRemaining = computed(() => {
  const diffMs = eventEndDate.value.getTime() - now.value.getTime()
  if (diffMs <= 0) return 'Event has ended'

  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `Ends in ${days}d ${hours}h ${minutes}m ${seconds}s`
})

const eventProgress = computed(() => {
  const total = eventEndDate.value.getTime() - eventStartDate.value.getTime()
  const elapsed = now.value.getTime() - eventStartDate.value.getTime()
  return Math.min(100, Math.max(0, (elapsed / total) * 100))
})

const topEarners = computed(() =>
  teams.value
    .flatMap((t) => t.members)
    .sort((a, b) => b.submissionTotal - a.submissionTotal)
    .slice(0, 10),
)

onMounted(async () => {
  try {
    const res = await axios.get('/api/leaderboard/teams')
    teams.value = res.data.map((team) => ({
      ...team,
      members: team.members.sort((a, b) => b.submissionTotal - a.submissionTotal),
    }))

    globalTotal.value = teams.value.reduce((sum, team) => sum + team.teamTotal, 0)

    const eventRes = await axios.get('/api/event')
    event.value = eventRes.data
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err)
  }
})

function formatNumber(value) {
  return value.toLocaleString()
}

function getTeamName(playerId) {
  for (const team of teams.value) {
    if (team.members.some((m) => m.id === playerId)) {
      return team.name
    }
  }
  return 'Unknown Team'
}
</script>

<template>
  <div
    class="max-w-7xl mx-auto p-6 mt-10 text-black dark:text-white transition-colors duration-300"
  >
    <h1 class="text-3xl font-bold text-center mb-8">Team Leaderboard</h1>

    <div class="text-xl text-center font-semibold mb-6">
      Total GP Earned:
      <span class="text-green-600 dark:text-green-400">{{ formatNumber(globalTotal) }} GP</span>
    </div>

    <div
      class="border border-yellow-400 dark:border-yellow-300 rounded-xl p-6 bg-white dark:bg-gray-800 shadow-sm mb-8 max-w-2xl mx-auto"
    >
      <div class="text-center">
        <div class="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Day {{ currentDay }} of 10
        </div>
        <div class="text-lg text-gray-600 dark:text-gray-400 mt-1">
          {{ timeRemaining }}
        </div>
      </div>

      <div class="w-full mt-4">
        <div class="w-full h-4 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-yellow-500 dark:bg-yellow-400 transition-all duration-500"
            :style="{ width: `${eventProgress.toFixed(2)}%` }"
          ></div>
        </div>
        <div class="text-lg text-center mt-2 font-bold text-yellow-700 dark:text-yellow-300">
          {{ eventProgress.toFixed(1) }}% of the event completed
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Top Earners (shown on top for mobile, right side on desktop) -->
      <div class="lg:order-last lg:col-span-1">
        <div
          class="bg-white dark:bg-gray-800 shadow rounded-xl p-5 border border-gray-200 dark:border-gray-700 h-fit"
        >
          <h2 class="text-xl font-bold mb-4 text-purple-700 dark:text-purple-400">
            Biggest Spooners
          </h2>
          <ol class="space-y-3">
            <li
              v-for="(player, index) in topEarners"
              :key="player.id"
              class="text-sm text-gray-800 dark:text-gray-200"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-bold text-base text-blue-800 dark:text-blue-300">
                    {{ index + 1 }}. {{ player.rsn }}
                    <span
                      v-if="player.discriminator && player.discriminator !== '0'"
                      class="text-gray-500 dark:text-gray-400 font-normal"
                    >
                      #{{ player.discriminator }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-600 dark:text-gray-400 italic">
                    {{ getTeamName(player.id) }}
                  </div>
                </div>
                <div class="font-semibold text-green-600 dark:text-green-400 text-sm">
                  {{ formatNumber(player.submissionTotal) }} GP
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>

      <!-- Team Cards: Centered on large screens -->
      <div class="lg:col-span-3">
        <div class="grid md:grid-cols-2 gap-6">
          <div
            v-for="team in teams"
            :key="team.id"
            class="bg-white dark:bg-gray-800 shadow rounded-xl p-5 border border-gray-200 dark:border-gray-700"
          >
            <h2 class="text-2xl font-semibold mb-3 text-blue-700 dark:text-blue-400">
              {{ team.name }}
            </h2>
            <div class="text-gray-700 dark:text-gray-300 mb-4">
              Team Total:
              <span class="font-bold text-green-600 dark:text-green-400">
                {{ formatNumber(team.teamTotal) }} GP
              </span>
            </div>

            <ul class="space-y-2">
              <li v-for="member in team.members" :key="member.id" class="flex items-center gap-3">
                <img
                  v-if="member.avatar"
                  :src="member.avatar"
                  alt="avatar"
                  class="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600"
                />
                <div
                  v-else
                  class="w-10 h-10 flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-lg font-bold rounded-full"
                >
                  {{ member.rsn.charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-lg text-blue-800 dark:text-blue-300">
                    {{ member.rsn
                    }}<span
                      v-if="member.discriminator && member.discriminator !== '0'"
                      class="text-gray-500 dark:text-gray-400"
                      >#{{ member.discriminator }}</span
                    >
                  </div>
                  <div
                    class="mt-1 inline-block px-2 py-1 text-sm font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900 rounded-md"
                  >
                    {{ formatNumber(member.submissionTotal) }} GP
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
