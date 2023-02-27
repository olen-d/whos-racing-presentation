<script setup>
  import { onMounted, ref } from 'vue'

  const config = useRuntimeConfig()

  const isLoading = ref(true)
  const races = ref({})
  const error = ref(null)

  onMounted(async () => {
    isLoading.value = true

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/v1/races/upcoming`)

      if (response.ok) {
        const result = await response.json()
        isLoading.value = false
        races.value = result.data
      } else {
        throw new Error('Network response was not ok. Unable to fetch races. ')
      }
    } catch (err) {
      error.value = err.toString()
      isLoading.value = false
    }
  })
</script>

<template>
  <div class="races">
    <v-card
      class="mt-16 mx-auto float-sm-left mr-sm-10"
      width="340"
      v-for="{ _id, raceName, raceUrl, date, city, state, promoterNames } in races"
      :key="_id"
    >
      <template #title>
        <span class="card-title"><NuxtLink v-if="raceUrl" :to="raceUrl">{{ raceName }}</NuxtLink><span v-else>{{ raceName }}</span></span>
      </template>
      <template #subtitle>
        <div class="race-date">
          {{ new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}).format(new Date(date)) }}
        </div>
        <div class="race-time">
          {{ new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', dayPeriod: 'short' }).format(new Date(date)) }}
        </div>
      </template>
      <template #text>
        <div class="race-location">
          {{ city }}, {{ state }}
        </div>
        <div class="race-promoters">
          <NuxtLink v-if="promoterNames[0].promoterUrl" :to="promoterNames[0].promoterUrl">{{ promoterNames[0].promoterName }}</NuxtLink><span v-else>{{ promoterNames[0].promoterName }}</span>
        </div>
      </template>
    </v-card>
  </div>
</template>

<style scoped>
  .card-title a:link, a:visited {
    color: #3f51b5;
    text-decoration: none;
  }
  .card-title a:hover, a:active {
    color: #81d4fa;
  }
  .race-promoters a:link {
    color: #3f51b5;
    text-decoration: none;
  }
  .race-promoters a:visited {
    color: #3f51b5;
    text-decoration: none;
  }
  .race-promoters a:hover {
    color: #81d4fa;
  }
  .race-promoters a:active {
    color: #81d4fa;
  }
  .item:last-child {
    margin-bottom: 16px;
  }
</style>
