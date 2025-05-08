<script setup>
import { ref, computed } from 'vue'
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

const isFormValid = computed(() => {
  return form.value.rsn && form.value.name && form.value.value && form.value.proof
})
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

      <!-- Image preview if URL is valid -->
      <div v-if="form.proof" class="mt-4 text-center">
        <h2 class="text-md font-medium text-gray-800 mb-2">Image Preview</h2>
        <img
          :src="form.proof"
          alt="Image Preview"
          class="max-w-full h-auto rounded-md shadow-md border-2 border-gray-300"
        />
      </div>

      <div class="text-center">
        <button
          type="submit"
          :disabled="!isFormValid"
          class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
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
