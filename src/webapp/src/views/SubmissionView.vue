<script setup>
import { ref } from 'vue'
import axios from 'axios'

const form = ref({
  rsn: '',
  name: '',
  value: '',
  proof: '',
})

const successMessage = ref('')
const errorMessage = ref('')

async function submitForm() {
  errorMessage.value = ''
  try {
    await axios.post('/api/submit', form.value)
    successMessage.value = 'Submission sent successfully!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000) // Clear success message after 3 seconds
    form.value = { rsn: '', name: '', value: '', proof: '' }
  } catch (err) {
    console.error(err)
    errorMessage.value =
      err.response?.data?.error + err.response?.data?.details ||
      'Failed to submit. Please try again.'
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-lg">
    <h1 class="text-2xl font-bold mb-6 text-center">Submit Item</h1>

    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">RSN</label>
        <input
          v-model="form.rsn"
          type="text"
          required
          class="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Item Name</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Item Value</label>
        <input
          v-model="form.value"
          type="text"
          placeholder="e.g. 200000000 or 200m"
          required
          class="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Image Proof URL</label>
        <input
          v-model="form.proof"
          type="url"
          required
          placeholder="Must be a direct image link"
          class="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div class="text-center">
        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
          Submit
        </button>
      </div>

      <!-- Error and Success Messages -->
      <div v-if="errorMessage" class="text-red-600 text-center mt-2">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="text-green-600 text-center mt-2">
        {{ successMessage }}
      </div>
    </form>
  </div>
</template>
