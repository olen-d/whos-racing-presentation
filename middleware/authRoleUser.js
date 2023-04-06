export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  if (process.server) {
    const config = useRuntimeConfig()

    const refreshTokenSPA = useCookie('refreshTokenSPA')
    authStore.currentRefreshToken = refreshTokenSPA.value

    authStore.apiBaseUrl = config.apiBaseUrl
  }

  await authStore.checkBearerExpiration()

  const { isAuthorized, role } = authStore

  const rolesAuthorized = ['user', 'admin', 'superadmin']
  const isAuthorizedRole = rolesAuthorized.indexOf(role) !== -1

  if (! isAuthorized) {
    return navigateTo('/login')
  } else if (!isAuthorizedRole) {
    return abortNavigation()
  }
})
