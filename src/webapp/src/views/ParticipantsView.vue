<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import axios from 'axios'

const event = ref(null)
const loading = ref(true)
const error = ref('')
const countdown = ref('')
let interval

function updateCountdown(startDate) {
  const now = new Date()
  const start = new Date(startDate)
  const diff = start - now

  if (diff <= 0) {
    countdown.value = 'Event has started!'
    clearInterval(interval)
    return
  }

  const seconds = Math.floor((diff / 1000) % 60)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  countdown.value = [
    days > 0 ? `${days}d` : '',
    days > 0 || hours > 0 ? `${hours}h` : '',
    days > 0 || hours > 0 || minutes > 0 ? `${minutes}m` : '',
    `${seconds}s`,
  ]
    .filter(Boolean)
    .join(' ')
}

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/event')
    event.value = data
    updateCountdown(data.startDate)
    interval = setInterval(() => updateCountdown(data.startDate), 1000)
  } catch (err) {
    console.error(err)
    error.value = 'Failed to load event details.'
  } finally {
    loading.value = false
  }
})

onUnmounted(() => clearInterval(interval))
</script>

<template>
  <div class="max-w-5xl mx-auto p-6 mt-10 bg-white shadow-md rounded-lg">
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else>
      <h1 class="text-3xl font-bold mb-2">{{ event.name }}</h1>
      <p class="text-gray-600 mb-4">
        Status: <strong>{{ event.status }}</strong>
      </p>
      <p class="mb-2">Start Date: {{ new Date(event.startDate).toLocaleString() }}</p>
      <p class="text-sm text-gray-700 mb-4">
        Countdown: <span class="font-semibold">{{ countdown }}</span>
      </p>
      <p class="mb-4" v-if="event.description">{{ event.description }}</p>

      <h2 class="text-xl font-semibold mt-8 mb-2">
        Participants ({{ event.participants.length }})
      </h2>
      <table class="w-full text-left border border-gray-300">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 border">Discord Username</th>
            <th class="p-2 border">RSN</th>
            <th class="p-2 border">Status</th>
            <th class="p-2 border">Duo?</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in event.participants" :key="p.userId">
            <td class="p-2 border">
              <div class="flex items-center space-x-2">
                <div
                  v-if="!p.user.avatar"
                  class="w-6 h-6 flex items-center justify-center bg-gray-300 text-xs font-bold rounded-full"
                >
                  {{ p.user.username.charAt(0).toUpperCase() }}
                </div>
                <img v-else :src="p.user.avatar" alt="avatar" class="w-6 h-6 rounded-full" />
                <span>
                  {{ p.user.username
                  }}<span v-if="p.user.discriminator && p.user.discriminator !== '0'"
                    >#{{ p.user.discriminator }}</span
                  >
                </span>
              </div>
            </td>
            <td class="p-2 border">{{ p.rsn || '—' }}</td>
            <td class="p-2 border">{{ p.status }}</td>
            <td class="p-2 border">{{ p.note || '—' }}</td>
          </tr>
        </tbody>
      </table>

      <p v-if="event.participants.length === 0" class="mt-4 text-gray-500">No participants yet.</p>
    </div>
  </div>
</template>
