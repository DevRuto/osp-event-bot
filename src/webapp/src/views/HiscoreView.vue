<script setup>
import { ref, onMounted } from 'vue'
import PlayerHiscore from '@/components/PlayerHiscore.vue'
import OverallHiscore from '@/components/OverallHiscore.vue'

const hiscoreData = ref({})
const activeTab = ref('players') // 'players' or 'overall'

onMounted(async () => {
  const res = await fetch('/api/hiscore')
  hiscoreData.value = await res.json()
})
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 text-base">
    <div class="mb-4 flex gap-4">
      <button
        class="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700"
        :class="{ 'bg-gray-700': activeTab === 'players' }"
        @click="activeTab = 'players'"
      >
        Player Hiscores
      </button>
      <button
        class="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700"
        :class="{ 'bg-gray-700': activeTab === 'overall' }"
        @click="activeTab = 'overall'"
      >
        Overall
      </button>
    </div>

    <div v-if="activeTab === 'players'">
      <PlayerHiscore :hiscoreData="hiscoreData" />
    </div>
    <div v-else>
      <OverallHiscore :hiscoreData="hiscoreData" />
    </div>
  </div>
</template>
