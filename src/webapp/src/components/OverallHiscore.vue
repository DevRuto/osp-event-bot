<script setup>
import { ref, computed } from 'vue'

const activeTab = ref('bosses')
const selectedTeam = ref('All Teams')

const props = defineProps({
  hiscoreData: {
    type: Object,
    required: true,
  },
})

const teamNames = computed(() => {
  const names = new Set()
  for (const player of Object.values(props.hiscoreData)) {
    if (player.teamName) names.add(player.teamName)
  }
  return ['All Teams', ...Array.from(names).sort()]
})

const filteredPlayers = computed(() => {
  if (selectedTeam.value === 'All Teams') {
    return Object.values(props.hiscoreData)
  }
  return Object.values(props.hiscoreData).filter((player) => player.teamName === selectedTeam.value)
})

function totalXp(skills) {
  return Object.values(skills || {}).reduce((sum, skill) => sum + (skill.xp || 0), 0)
}

const overallTotals = computed(() => {
  const total = { ehp: 0, ehb: 0, totalXp: 0 }
  for (const player of filteredPlayers.value) {
    total.ehp += player.ehp?.total ?? 0
    total.ehb += player.ehb?.total ?? 0
    total.totalXp += totalXp(player.diff.skills)
  }
  return total
})

const overallBossKills = computed(() => {
  const totals = {}
  for (const player of filteredPlayers.value) {
    for (const [bossName, data] of Object.entries(player.diff.bosses || {})) {
      if (data.kills > 0) {
        totals[bossName] = (totals[bossName] || 0) + data.kills
      }
    }
  }
  return Object.entries(totals).sort((a, b) => b[1] - a[1]) // Sort by kills descending
})

const overallSkillXp = computed(() => {
  const totals = {}
  for (const player of filteredPlayers.value) {
    for (const [skillName, data] of Object.entries(player.diff.skills || {})) {
      if (data.xp > 0) {
        totals[skillName] = (totals[skillName] || 0) + data.xp
      }
    }
  }
  return Object.entries(totals).sort((a, b) => b[1] - a[1]) // Sort by XP descending
})

const formatNumber = (num) => new Intl.NumberFormat().format(num)
</script>

<template>
  <div class="max-w-screen-lg mx-auto space-y-6">
    <div class="bg-gray-800 p-4 rounded shadow">
      <h2 class="text-xl font-bold mb-2">Overall Totals</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div>
          <div class="text-gray-400">Total EHP</div>
          <div class="font-bold text-white">{{ formatNumber(overallTotals.ehp) }}</div>
        </div>
        <div>
          <div class="text-gray-400">Total EHB</div>
          <div class="font-bold text-white">{{ formatNumber(overallTotals.ehb) }}</div>
        </div>
        <div>
          <div class="text-gray-400">Total XP</div>
          <div class="font-bold text-white">{{ formatNumber(overallTotals.totalXp) }}</div>
        </div>
      </div>
    </div>

    <!-- Tab Buttons -->
    <div class="flex space-x-2">
      <select
        v-model="selectedTeam"
        class="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 text-sm"
      >
        <option v-for="team in teamNames" :key="team" :value="team">
          {{ team }}
        </option>
      </select>
      <button
        @click="activeTab = 'bosses'"
        :class="[
          'px-4 py-2 rounded-t text-sm font-medium',
          activeTab === 'bosses'
            ? 'bg-gray-700 text-white'
            : 'bg-gray-600 text-gray-300 hover:bg-gray-500',
        ]"
      >
        Bosses
      </button>
      <button
        @click="activeTab = 'skills'"
        :class="[
          'px-4 py-2 rounded-t text-sm font-medium',
          activeTab === 'skills'
            ? 'bg-gray-700 text-white'
            : 'bg-gray-600 text-gray-300 hover:bg-gray-500',
        ]"
      >
        Skills
      </button>
    </div>

    <!-- Tab Panels -->
    <div class="bg-gray-800 p-4 rounded-b shadow">
      <h2 class="text-xl font-bold mb-2">
        {{ activeTab === 'bosses' ? 'Total Boss Gains' : 'Total XP by Skill' }}
      </h2>

      <table class="w-full text-sm border border-gray-600">
        <thead>
          <tr class="bg-gray-700">
            <th class="p-2 text-left">{{ activeTab === 'bosses' ? 'Boss' : 'Skill' }}</th>
            <th class="p-2 text-right">
              {{ activeTab === 'bosses' ? 'Total Kills' : 'Total XP' }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="[name, value] in activeTab === 'bosses' ? overallBossKills : overallSkillXp"
            :key="name"
            class="border-t border-gray-600"
          >
            <td class="p-2 capitalize">{{ name }}</td>
            <td class="p-2 text-right">{{ formatNumber(value) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
