<script setup>

  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  authStore.apiBaseUrl = config.apiBaseUrl

  const refreshTokenSPA = useCookie('refreshTokenSPA')
  authStore.currentRefreshToken = refreshTokenSPA.value

  await authStore.checkBearerExpiration()
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>
