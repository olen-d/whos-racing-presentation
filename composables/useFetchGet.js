
  import { ref } from 'vue'

  export const useFetchGet = async (accessToken, config, errorMessage, endpoint) => {
    const error = ref(null)
    const isLoading = ref(true)
    const fetchResult = ref({})

    const doFetch = async (accessToken, config, errorMessage, endpoint) => {
      error.value = null
      isLoading.value = true
      fetchResult.value = {}

      try {
        const response = await fetch(
          `${config.apiBaseUrl}/${endpoint}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          })
  
        if (response.ok) {
          const result = await response.json()
          isLoading.value = false
          fetchResult.value = result
        } else {
          throw new Error(`Network response was not ok. ${errorMessage}`)
        }
      } catch (err) {
        error.value = err.toString()
        isLoading.value = false
      }
    }

    const refresh = async (accessToken, config, errorMessage, endpoint) => await doFetch(accessToken, config, errorMessage, endpoint)

    await doFetch(accessToken, config, errorMessage, endpoint)

  return { error, isLoading, fetchResult, refresh }
}
