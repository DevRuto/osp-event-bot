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
  <div class="max-w-screen-lg mx-auto space-y-6">
    <div class="mb-4 flex gap-2 bg-gray-700 p-1 rounded-full w-max">
      <button
        class="px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200"
        :class="
          activeTab === 'players' ? 'bg-white text-gray-900' : 'text-gray-300 hover:bg-gray-600'
        "
        @click="activeTab = 'players'"
      >
        Player Hiscores
      </button>
      <button
        class="px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200"
        :class="
          activeTab === 'overall' ? 'bg-white text-gray-900' : 'text-gray-300 hover:bg-gray-600'
        "
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
