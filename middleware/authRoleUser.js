export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  authStore.checkBearerExpiration()

  const { isAuthorized, role } = authStore

  const rolesAuthorized = ['user', 'admin', 'superadmin']
  const isAuthorizedRole = rolesAuthorized.indexOf(role) !== -1

  if (! isAuthorized) {
    return navigateTo('/login')
  } else if (!isAuthorizedRole) {
    return abortNavigation()
  }
})
