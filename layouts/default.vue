<script setup>
  import { ref, watch } from 'vue'
  import { storeToRefs } from 'pinia'

  const config = useRuntimeConfig()

  const authStore = useAuthStore()
  const route = useRoute()

  authStore.apiBaseUrl = config.apiBaseUrl

  const { isAuthorized, role } = storeToRefs(authStore)

  const drawer = ref(false)

  const rolesAuthorized = ['user', 'admin', 'superadmin']
  const isAuthorizedRole = rolesAuthorized.indexOf(role.value) !== -1

  const linksAdmin = [
    { title: 'Manage Promoters', icon: 'mdi-application-edit-outline', to: '/admin/promoters'},
    { title: 'Manage Races', icon: 'mdi-application-edit-outline', to: '/admin/races'}
  ]

  const linksPublic = [
    { title: 'Home', icon: 'mdi-home', to: '/' },
  ]

  const linksSignedOut = [
    { title: 'Sign In', icon: 'mdi-account', to: '/login' },
    { title: 'Sign Up', icon: 'mdi-account-plus', to: '/signup'}
  ]

  const handleLogout = () => {
    authStore.doLogout = true
  }

  const logout = async () => {
    authStore.$reset()
    
    const endpoint = 'api/v1/auth/token/refresh/clear-cookie'
    const errorMessage = 'unable to clear refresh token cookie'

    const { error, isLoading, fetchResult, refresh } = await useFetchGet(null, config, errorMessage, endpoint)

    drawer.value = false

    const { path } = route
    if (path !== '/') { await navigateTo({ path: '/' }) }
  }

  const toggleDrawer = () => { drawer.value = !drawer.value}

  watch(() => authStore.doLogout, (newDoLogout, prevDoLogout) => {
    if (newDoLogout) {
      logout()
    }
  })
</script>
<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <v-list dense nav>
        <v-list-item v-for="item in linksPublic" :key="item.title" :to="item.to" router exact>
          <template v-slot:prepend>
            <v-icon :icon="item.icon"></v-icon>
          </template>
          <v-list-item :title="item.title"></v-list-item>
        </v-list-item>
      </v-list>
      <v-list v-if="!isAuthorized" dense nav>
        <v-list-item v-for="item in linksSignedOut" :key="item.title" :to="item.to" router exact>
          <template v-slot:prepend>
            <v-icon :icon="item.icon"></v-icon>
          </template>
          <v-list-item :title="item.title"></v-list-item>
        </v-list-item>
      </v-list>
      <v-divider v-if="isAuthorized" />
      <v-list v-if="isAuthorized && isAuthorizedRole" dense nav >
        <v-list-item v-for="item in linksAdmin" :key="item.title" :to="item.to" router exact>
          <template v-slot:prepend>
            <v-icon :icon="item.icon"></v-icon>
          </template>
          <v-list-item :title="item.title"></v-list-item>
        </v-list-item>
      </v-list>
      <template #append v-if="isAuthorized">
        <div class="pa-2">
          <v-btn
            block
            color="primary"
            prepend-icon="mdi-account-remove-outline"
            @click="handleLogout"
          >
            Sign Out
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>
    <v-app-bar app><v-app-bar-nav-icon @click="toggleDrawer"/><v-app-bar-title>Who's Racing?</v-app-bar-title></v-app-bar>
      <v-main>
        <v-container>
          <slot></slot>
        </v-container>
      </v-main>
      <v-footer class="bg-indigo-darken-1 text-center d-block mt-16">
        <v-container>
          <v-row class="footer-links mb-4">
            <v-col cols="12" md="4">
              <h3 class="text-left text-md-center">
                Who's Racing?
              </h3>
              <p class="text-body-2 text-indigo-lighten-4 text-left mt-2">
                A website to help friends see who is going to various gravel races. Based in Asheville, North Carolina.
              </p>
            </v-col>
            <v-col cols="12" md="4">
              <h3 class="text-left text-md-center">
                Powered By
              </h3>
              <v-list lines="3" class="bg-indigo-darken-1 text-left">
                <v-list-item subtitle="Source code for the Who's Racing front end." class="bg-indigo-darken-1">
                  <template #prepend>
                    <v-icon icon="mdi-github"/>
                  </template>
                  <template #title>
                    <NuxtLink to="https://github.com/olen-d/whos-racing-presentation">Who's Racing Presentation</NuxtLink>
                  </template>
                </v-list-item>
                <v-list-item subtitle="Source code for the application programming interface (API) behind Who's Racing." class="bg-indigo-darken-1">
                  <template #prepend>
                    <v-icon icon="mdi-github"/>
                  </template>
                  <template #title>
                    <NuxtLink to="https://github.com/olen-d/whos-racing-api">Who's Racing API</NuxtLink>
                  </template>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="4">
              <h3 class="text-left text-md-center">
                Presented By
              </h3>
              <v-list lines="3" class="bg-indigo-darken-1 text-left">
                <v-list-item subtitle="Asheville gravel cycling routes." class="bg-indigo-darken-1">
                  <template #prepend>
                    <v-icon icon="mdi-link-variant"/>
                  </template>
                  <template #title>
                    <NuxtLink to="https://www.nocargravel.cc">No. Car. Gravel.</NuxtLink>
                  </template>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
          <v-divider />
          <v-row class="mt-4">
            <v-col cols="12">
              <div class="footer-copyright text-body-2">
                Copyright &copy; {{ new Date().getFullYear() }} <NuxtLink to="https://www.olen.dev">Olen Daelhousen</NuxtLink>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-footer>
  </v-app>
</template>

<style scoped>
  .footer-links a:link {
    color: #ffffff;
    text-decoration: none;
  }
  .footer-links a:visited {
    color: #ffffff;
    text-decoration: none;
  }
  .footer-links a:hover {
    color: #81d4fa;
  }
  .footer-links a:active {
    color: #81d4fa;
  }
  .footer-copyright a:link {
    color: #ffffff;
    text-decoration: none;
  }
  .footer-copyright a:visited {
    color: #ffffff;
    text-decoration: none;
  }
  .footer-copyright a:hover {
    color: #81d4fa;
  }
  .footer-copyright a:active {
    color: #81d4fa;
  }
</style>