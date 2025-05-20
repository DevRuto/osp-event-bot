<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import axios from 'axios'

const prices = ref({})
const loadingPrices = ref(true)
const priceError = ref('')

// Load initial toggle state from localStorage or default to false
const useCompactFormat = ref(localStorage.getItem('useCompactFormat') === 'true' || false)

async function fetchPrices() {
  try {
    const { data } = await axios.get('/api/prices')
    prices.value = data
  } catch (err) {
    priceError.value = 'Failed to load prices.'
    console.error(err)
  } finally {
    loadingPrices.value = false
  }
}

onMounted(async () => {
  fetchPrices()

  // Fetch prices every hour
  const intervalId = setInterval(
    () => {
      fetchPrices()
    },
    60 * 60 * 1000,
  )

  onUnmounted(() => {
    clearInterval(intervalId)
  })
})

// Watch toggle changes and save to localStorage
watch(useCompactFormat, (newVal) => {
  localStorage.setItem('useCompactFormat', newVal)
})

const formattedPrices = computed(() => {
  const formatter = new Intl.NumberFormat('en', {
    notation: useCompactFormat.value ? 'compact' : 'standard',
    compactDisplay: 'short',
  })

  return Object.entries(prices.value).map(([name, value]) => ({
    name,
    value: formatter.format(value),
  }))
})

const valuePattern = /^(\d+(\.\d+)?)([kmb])?$/i
const isValueValid = computed(() => valuePattern.test(form.value.value.trim()))

const normalizedValue = computed(() => {
  const input = form.value.value.trim().toLowerCase()
  const match = input.match(/^(\d+(\.\d+)?)([kmb])?$/)

  if (!match) return null

  let [, numStr, , suffix] = match
  let num = parseFloat(numStr)

  switch (suffix) {
    case 'k':
      num *= 1_000
      break
    case 'm':
      num *= 1_000_000
      break
    case 'b':
      num *= 1_000_000_000
      break
  }

  return Math.round(num).toLocaleString()
})

const form = ref({
  rsn: '',
  name: '',
  value: '',
  proof: '',
  self: false,
})

const inputFile = ref(null)

const selectedImageFile = ref(null)
const successMessage = ref('')
const errorMessage = ref('')
const submittingForm = ref(false)

const isFormValid = computed(() => {
  return (
    form.value.rsn &&
    form.value.name &&
    isValueValid.value &&
    (form.value.proof || selectedImageFile.value)
  )
})

async function handleImageUpload(event) {
  const file = event.target.files?.[0] || event.clipboardData?.items?.[0]?.getAsFile?.()
  if (file && file.type.startsWith('image/')) {
    selectedImageFile.value = file
    form.value.proof = URL.createObjectURL(file)
    form.value.self = true
  }
}

async function submitForm() {
  errorMessage.value = ''
  submittingForm.value = true

  try {
    // Upload image if selected but not yet uploaded
    if (selectedImageFile.value && form.value.self) {
      const formData = new FormData()
      formData.append('image', selectedImageFile.value)

      const { data } = await axios.post('/api/image', formData)
      form.value.proof = window.location.origin + data.path
      form.value.self = true
    }

    await axios.post('/api/submit', form.value)

    successMessage.value = 'Submission sent successfully!'
    setTimeout(() => (successMessage.value = ''), 3000)

    // Reset form
    form.value = { rsn: '', name: '', value: '', proof: '', self: false }
    selectedImageFile.value = null
    inputFile.value.value = ''
  } catch (err) {
    console.error(err)
    errorMessage.value =
      err.response?.data?.error + err.response?.data?.details ||
      'Failed to submit. Please try again.'
  } finally {
    submittingForm.value = false
  }
}

function clearImage() {
  form.value.proof = ''
  form.value.self = false
}
</script>

<template>
  <div
    class="max-w-xl mx-auto p-6 mt-10 bg-white dark:bg-gray-800 shadow-lg rounded-lg text-black dark:text-white transition-colors duration-300"
    @paste="handleImageUpload"
  >
    <h1 class="text-2xl font-bold mb-6 text-center">Submit Item</h1>

    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">RSN</label>
        <input
          v-model="form.rsn"
          type="text"
          required
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-black dark:text-white"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-black dark:text-white"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Value</label>
        <input
          v-model="form.value"
          type="text"
          placeholder="e.g. 200000000 or 200m"
          required
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-black dark:text-white"
        />
        <p v-if="form.value && isValueValid" class="text-sm mt-1 text-gray-600 dark:text-gray-300">
          Normalized value:
          <span class="font-medium text-blue-600 dark:text-blue-400">{{ normalizedValue }} GP</span>
        </p>

        <p v-else-if="form.value" class="text-sm mt-1 text-red-600 dark:text-red-400">
          Invalid format. Use numbers optionally followed by <code>k</code>, <code>m</code>, or
          <code>b</code> (e.g. <code>200000000</code> or <code>200m</code>).
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >Image Proof</label
        >
        <div class="relative">
          <input
            :value="
              form.self && form.proof.startsWith('blob:') ? 'Displaying image preview' : form.proof
            "
            @input="
              (e) => {
                form.proof = e.target.value
                form.self = false
              }
            "
            type="text"
            placeholder="Paste an image or direct image url"
            required
            class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md pr-16 bg-white dark:bg-gray-900 text-black dark:text-white"
            :disabled="form.self && form.proof.startsWith('blob:')"
          />
          <button
            v-if="form.self && form.proof.startsWith('blob:')"
            type="button"
            @click="clearImage"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-red-500 hover:text-red-700 border border-red-500 rounded-md py-1 px-3 bg-white dark:bg-gray-900 hover:bg-red-100 dark:hover:bg-red-900 cursor-pointer"
          >
            Clear Preview
          </button>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >Upload or Paste Image</label
        >
        <input
          ref="inputFile"
          type="file"
          accept="image/*"
          @change="handleImageUpload"
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-black dark:text-white"
        />
      </div>

      <div
        v-if="form.proof"
        class="mt-4 text-center border border-gray-300 dark:border-gray-600 p-4 rounded bg-gray-50 dark:bg-gray-700"
      >
        <h2 class="text-md font-medium text-gray-800 dark:text-white mb-2">Image Preview</h2>
        <img
          :src="form.proof"
          alt="Image Preview"
          class="max-w-full h-auto rounded-md shadow-md border-2 border-gray-300 dark:border-gray-600"
        />
      </div>

      <div class="text-center">
        <button
          type="submit"
          :disabled="!isFormValid || submittingForm"
          class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {{ submittingForm ? 'Submitting...' : 'Submit' }}
        </button>
      </div>

      <div v-if="errorMessage" class="text-red-600 dark:text-red-400 text-center mt-2">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="text-green-600 dark:text-green-400 text-center mt-2">
        {{ successMessage }}
      </div>
    </form>
    <div class="mt-10">
      <h2 class="text-xl font-bold mb-4 text-center">Latest Prices</h2>

      <div class="flex justify-center items-center mb-4">
        <span class="mr-3 text-gray-700 dark:text-gray-300 select-none">Compact notation</span>
        <button
          @click="useCompactFormat = !useCompactFormat"
          :aria-pressed="useCompactFormat.toString()"
          class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          :class="useCompactFormat ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'"
        >
          <span
            class="inline-block w-5 h-5 transform bg-white rounded-full shadow ring-0 transition-transform"
            :class="useCompactFormat ? 'translate-x-6' : 'translate-x-1'"
          ></span>
        </button>
      </div>

      <div v-if="loadingPrices" class="text-center text-gray-500 dark:text-gray-300">
        Loading prices...
      </div>
      <div v-else-if="priceError" class="text-center text-red-600 dark:text-red-400">
        {{ priceError }}
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full table-auto border-collapse text-sm">
          <thead>
            <tr class="bg-gray-200 dark:bg-gray-700 text-left">
              <th class="p-2 border border-gray-300 dark:border-gray-600">Item</th>
              <th class="p-2 border border-gray-300 dark:border-gray-600">Price (GP)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in formattedPrices"
              :key="item.name"
              class="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <td class="p-2 border border-gray-300 dark:border-gray-600">{{ item.name }}</td>
              <td class="p-2 border border-gray-300 dark:border-gray-600">{{ item.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
