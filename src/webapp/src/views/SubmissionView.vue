<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'

const form = ref({
  rsn: '',
  name: '',
  value: '',
  proof: '',
  self: false,
})

const selectedImageFile = ref(null)
const successMessage = ref('')
const errorMessage = ref('')
const submittingForm = ref(false)

const isFormValid = computed(() => {
  return (
    form.value.rsn &&
    form.value.name &&
    form.value.value &&
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
    if (selectedImageFile.value && !form.value.self) {
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
  <div class="max-w-xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-lg" @paste="handleImageUpload">
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

      <!-- Image Proof URL Field -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Image Proof</label>
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
            class="w-full p-2 border border-gray-300 rounded-md pr-16"
            :disabled="form.self && form.proof.startsWith('blob:')"
          />
          <button
            v-if="form.self && form.proof.startsWith('blob:')"
            type="button"
            @click="clearImage"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-red-500 hover:text-red-700 border border-red-500 rounded-md py-1 px-3 bg-white hover:bg-red-100 cursor-pointer"
          >
            Clear Preview
          </button>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Upload or Paste Image</label>
        <input
          type="file"
          accept="image/*"
          @change="handleImageUpload"
          class="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div v-if="form.proof" class="mt-4 text-center border border-gray-300 p-4 rounded">
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
          :disabled="!isFormValid || submittingForm"
          class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {{ submittingForm ? 'Submitting...' : 'Submit' }}
        </button>
      </div>

      <div v-if="errorMessage" class="text-red-600 text-center mt-2">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="text-green-600 text-center mt-2">
        {{ successMessage }}
      </div>
    </form>
  </div>
</template>
