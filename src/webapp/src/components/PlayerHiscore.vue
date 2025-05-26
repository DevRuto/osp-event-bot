<script setup>
import { ref, computed, onMounted } from 'vue'
import { getTeamColor } from '@/utils/colors.js'

const props = defineProps({
  hiscoreData: {
    type: Object,
    required: true,
  },
})

const sortKey = ref('ehp')
const sortAsc = ref(false)
const activeTab = ref({})
const expandedRows = ref({})
const selectedTeam = ref('All Teams')

onMounted(() => {
  sortBy('ehb')
})

function totalXp(skills) {
  return Object.values(skills || {}).reduce((sum, skill) => sum + (skill.xp || 0), 0)
}

const teams = computed(() => {
  const set = new Set()
  Object.values(props.hiscoreData).forEach((player) => {
    if (player.teamName) set.add(player.teamName)
  })
  return ['All Teams', ...Array.from(set).sort()]
})

const filteredData = computed(() => {
  if (selectedTeam.value === 'All Teams') return props.hiscoreData
  return Object.fromEntries(
    Object.entries(props.hiscoreData).filter(
      ([, player]) => player.teamName === selectedTeam.value,
    ),
  )
})

const sortedData = computed(() => {
  return Object.fromEntries(
    Object.entries(filteredData.value).sort(([, a], [, b]) => {
      const aVal =
        sortKey.value === 'rsn'
          ? a.rsn
          : sortKey.value === 'team'
            ? (a.teamName || '').toLowerCase()
            : sortKey.value === 'totalXp'
              ? totalXp(a.diff.skills)
              : (a[sortKey.value]?.total ?? 0)

      const bVal =
        sortKey.value === 'rsn'
          ? b.rsn
          : sortKey.value === 'team'
            ? (b.teamName || '').toLowerCase()
            : sortKey.value === 'totalXp'
              ? totalXp(b.diff.skills)
              : (b[sortKey.value]?.total ?? 0)

      return (sortAsc.value ? 1 : -1) * (aVal > bVal ? 1 : aVal < bVal ? -1 : 0)
    }),
  )
})

function sortBy(key) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = false
  }
}

function setActiveTab(rsn, tab) {
  activeTab.value[rsn] = tab
}

function toggleExpanded(rsn) {
  expandedRows.value[rsn] = !expandedRows.value[rsn]
  if (!activeTab.value[rsn]) {
    activeTab.value[rsn] = 'bosses'
  }
}

const formatNumber = (num) => new Intl.NumberFormat().format(num)
</script>

<style scoped>
th {
  user-select: none;
}
</style>

<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 text-base">
    <div class="max-w-screen-lg mx-auto mb-4">
      <label for="teamFilter" class="mr-2 font-semibold">Filter by Team:</label>
      <select
        id="teamFilter"
        v-model="selectedTeam"
        class="bg-gray-800 text-gray-100 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option v-for="team in teams" :key="team" :value="team">{{ team }}</option>
      </select>
    </div>
    <div class="overflow-x-auto max-w-screen-lg mx-auto">
      <table class="w-full table-auto border-collapse border border-gray-700 text-base">
        <thead>
          <tr class="bg-gray-800">
            <th class="p-2 sm:p-3 cursor-pointer w-32" @click="sortBy('rsn')">
              <div class="flex items-center gap-1">
                RSN
                <span class="text-xs">⇅</span>
              </div>
            </th>
            <th class="p-2 sm:p-3 cursor-pointer w-16 text-right" @click="sortBy('team')">
              <div class="flex items-center justify-end gap-1">
                Team
                <span class="text-xs">⇅</span>
              </div>
            </th>
            <th class="p-2 sm:p-3 cursor-pointer w-16 text-right" @click="sortBy('ehp')">
              <div class="flex items-center justify-end gap-1">
                EHP
                <span class="text-xs">⇅</span>
              </div>
            </th>
            <th class="p-2 sm:p-3 cursor-pointer w-16 text-right" @click="sortBy('ehb')">
              <div class="flex items-center justify-end gap-1">
                EHB
                <span class="text-xs">⇅</span>
              </div>
            </th>
            <th class="p-2 sm:p-3 cursor-pointer w-32 text-right" @click="sortBy('totalXp')">
              <div class="flex items-center justify-end gap-1">
                Total XP Gained
                <span class="text-xs">⇅</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(player, rsn) in sortedData" :key="rsn">
            <tr
              class="border-t border-gray-700 hover:bg-gray-800 cursor-pointer"
              @click="toggleExpanded(rsn)"
            >
              <td class="p-2 sm:p-3 font-semibold flex items-center gap-2">
                <svg
                  v-if="expandedRows[rsn]"
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: getTeamColor(player.teamName) }"
                  title="Team color"
                ></span>
                <img
                  v-if="player.profile?.user?.avatar"
                  :src="player.profile.user.avatar"
                  alt="avatar"
                  class="w-5 h-5 rounded-full"
                />
                <span>{{ rsn }}</span>
              </td>
              <td class="p-2 sm:p-3 text-right">{{ player.teamName }}</td>
              <td class="p-2 sm:p-3 text-right">{{ player.ehp?.total ?? 0 }}</td>
              <td class="p-2 sm:p-3 text-right">{{ player.ehb?.total ?? 0 }}</td>
              <td class="p-2 sm:p-3 text-right">{{ formatNumber(totalXp(player.diff.skills)) }}</td>
            </tr>
            <tr v-if="expandedRows[rsn]" class="border-b border-gray-700 bg-gray-800">
              <td colspan="4" class="p-3">
                <div class="mt-2">
                  <div class="flex space-x-4 mb-2">
                    <button
                      class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
                      :class="{ 'bg-gray-600': activeTab[rsn] === 'bosses' }"
                      @click.stop="setActiveTab(rsn, 'bosses')"
                    >
                      Bosses
                    </button>
                    <button
                      class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
                      :class="{ 'bg-gray-600': activeTab[rsn] === 'skills' }"
                      @click.stop="setActiveTab(rsn, 'skills')"
                    >
                      Skills
                    </button>
                  </div>
                  <div v-if="activeTab[rsn] === 'skills'">
                    <table class="w-full text-sm border border-gray-600">
                      <thead>
                        <tr class="bg-gray-700">
                          <th class="p-2 text-left">Skill</th>
                          <th class="p-2 text-right">XP Gained</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="[skillName, skillData] in Object.entries(player.diff.skills)
                            .filter(([, s]) => s.xp > 0)
                            .sort(([, a], [, b]) => b.xp - a.xp)"
                          :key="skillName"
                          class="border-t border-gray-600"
                        >
                          <td class="p-2 capitalize">{{ skillName }}</td>
                          <td class="p-2 text-right">{{ formatNumber(skillData.xp) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div v-else-if="activeTab[rsn] === 'bosses'">
                    <table class="w-full text-sm border border-gray-600">
                      <thead>
                        <tr class="bg-gray-700">
                          <th class="p-2 text-left">Boss</th>
                          <th class="p-2 text-right">Start KC</th>
                          <th class="p-2 text-right">End KC</th>
                          <th class="p-2 text-right">Kills Gained</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="[bossName, bossData] in Object.entries(player.diff.bosses)
                            .filter(([, b]) => b.kills > 0)
                            .sort(([, a], [, b]) => b.kills - a.kills)"
                          :key="bossName"
                          class="border-t border-gray-600"
                        >
                          <td class="p-2 capitalize">{{ bossName }}</td>
                          <td class="p-2 text-right">
                            {{ formatNumber(player.start.bosses?.[bossName]?.kills ?? 0) }}
                          </td>
                          <td class="p-2 text-right">
                            {{ formatNumber(player.end.bosses?.[bossName]?.kills ?? 0) }}
                          </td>
                          <td class="p-2 text-right">{{ formatNumber(bossData.kills) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
