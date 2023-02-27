
  import { ref } from 'vue'

  export const useFetchPost = async (accessToken, config, data, errorMsg, endpoint) => {
    const error = ref(null)
    const isLoading = ref(true)
    const fetchResult = ref({})

    isLoading.value = true

    try {
      const response = await fetch(`${config.apiBaseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'content-type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        isLoading.value = false
        fetchResult.value = result
      } else {
        throw new Error(`Network response was not ok. Unable to fetch. ${errorMsg}`)
      }
    } catch (err) {
      error.value = err.toString()
      isLoading.value = false
    }

    return { error, isLoading, fetchResult }
  }
