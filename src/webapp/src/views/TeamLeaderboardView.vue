<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const teams = ref([])
const globalTotal = ref(0)

onMounted(async () => {
  try {
    const res = await axios.get('/api/leaderboard/teams')
    teams.value = res.data

    globalTotal.value = teams.value.reduce((sum, team) => sum + team.teamTotal, 0)
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err)
  }
})

function formatNumber(value) {
  return value.toLocaleString()
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-6 mt-10">
    <h1 class="text-3xl font-bold text-center mb-8">Team Leaderboard</h1>

    <div class="text-xl text-center font-semibold mb-6">
      Total GP Earned: <span class="text-green-600">{{ formatNumber(globalTotal) }} GP</span>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <div v-for="team in teams" :key="team.id" class="bg-white shadow rounded-xl p-5 border">
        <h2 class="text-2xl font-semibold mb-3 text-blue-700">{{ team.name }}</h2>
        <div class="text-gray-700 mb-4">
          Team Total:
          <span class="font-bold text-green-600">{{ formatNumber(team.teamTotal) }} GP</span>
        </div>

        <ul class="space-y-2">
          <li v-for="member in team.members" :key="member.id" class="flex items-center gap-3">
            <img
              :src="member.avatar"
              alt="avatar"
              class="w-10 h-10 rounded-full border border-gray-300"
              v-if="member.avatar"
            />
            <div class="flex-1">
              <div class="font-medium">
                {{ member.username
                }}<span v-if="member.discriminator && member.discriminator !== '0'"
                  >#{{ member.discriminator }}</span
                >
              </div>
              <div class="text-sm text-gray-600">
                Total: {{ formatNumber(member.submissionTotal) }} GP
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
