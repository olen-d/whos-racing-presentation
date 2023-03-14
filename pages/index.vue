<script setup>
  import { storeToRefs } from 'pinia'

  const authStore = useAuthStore()
  await authStore.checkBearerExpiration()

  const { isAuthorized } = storeToRefs(authStore)
</script>

<template>
  <NuxtLayout>
    <div class="index">
      <div v-if="!isAuthorized" class="signed-out-banner">
        <v-banner
          icon=""
          color="info"
        >
          <template #text>
            <NuxtLink to="/login">Sign in</NuxtLink> to see who's going to races. Don't have an account yet? <NuxtLink to="/signup">Sign up</NuxtLink>.
          </template>
        </v-banner>
      </div>
      <h1 class="mt-16">Upcoming Races</h1>
      <div v-if="isAuthorized">
        <ListRacesParticipants />
      </div>
      <div v-else>
        <ListRaces />
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
  .signed-out-banner a:link {
    color: #3f51b5;
    text-decoration: none;
  }
  .signed-out-banner a:visited {
    color: #3f51b5;
    text-decoration: none;
  }
  .signed-out-banner a:hover {
    color: #81d4fa;
  }
  .signed-out-banner a:active {
    color: #81d4fa;
  }
</style>