
  import { ref } from 'vue'

  export const useFetchGet = async (config, endpoint) => {
    const error = ref(null)
    const isLoading = ref(true)
    const fetchResult = ref({})

    const doFetch = async (config, endpoint) => {
      error.value = null
      isLoading.value = true
      fetchResult.value = {}

      try {
        const response = await fetch(`${config.apiBaseUrl}/${endpoint}`)
  
        if (response.ok) {
          const result = await response.json()
          isLoading.value = false
          fetchResult.value = result
        } else {
          throw new Error('Network response was not ok. Unable to fetch promoters. ')
        }
      } catch (err) {
        error.value = err.toString()
        isLoading.value = false
      }
    }

    const refresh = async (config, endpoint) => await doFetch(config, endpoint)

    await doFetch(config, endpoint)

  return { error, isLoading, fetchResult, refresh }
}
