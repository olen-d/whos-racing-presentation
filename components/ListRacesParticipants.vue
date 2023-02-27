<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { storeToRefs } from 'pinia'

  const authStore = useAuthStore()
  const config = useRuntimeConfig()

  const isLoading = ref(true)
  const races = ref([])
  const error = ref(null)

  const { currentJWT: accessToken, sub } = storeToRefs(authStore)

  onMounted(async () => {
    isLoading.value = true

    try {
      const response = await fetch(
        `${config.apiBaseUrl}/api/v1/races/upcoming/participants`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken.value}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        isLoading.value = false
        result.data.forEach(item => {
          item.expand = false
        })
        races.value = result.data
      } else {
        throw new Error('Network response was not ok. Unable to fetch races and participants. ')
      }
    } catch (err) {
      error.value = err.toString()
      isLoading.value = false
    }
  })

  const createGoing = raceId => {
    const data = {
      raceId,
      action: 'create'
    }
    return fetchGoingUpdate(data)
  }

  const createInterested = raceId => {
    const data = {
      raceId,
      action: 'create'
    }
    return fetchInterestedUpdate(data)
  }

  const deleteGoing = raceId => {
    const data = {
      raceId,
      action: 'delete'
    }
    return fetchGoingUpdate(data)
  }

  const deleteInterested = raceId => {
    const data = {
      raceId,
      action: 'delete'
    }
    return fetchInterestedUpdate(data)
  }

  const fetchGoingById = async raceId => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/api/v1/races/going/${raceId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken.value}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        return result
      } else {
        throw new Error('Network response was not ok. Unable to fetch race going by id. ')
      }
    } catch (err) {
      error.value = err.toString()
      return false
    }
  }

  const fetchInterestedById = async raceId => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/api/v1/races/interested/${raceId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken.value}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        return result
      } else {
        throw new Error('Network response was not ok. Unable to fetch race interested by id. ')
      }
    } catch (err) {
      error.value = err.toString()
      return false
    }
  }

  const fetchGoingUpdate = async data => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/v1/races/going`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
          'content-type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        const result = await response.json()
        const { status, data: { modifiedCount }, } = result
        return status === 'ok' && modifiedCount > 0
      } else {
        throw new Error('Network response was not ok. Unable to update racers going. ')
      }
    } catch (err) {
      error.value = err.toString()
    }
  }

  const fetchInterestedUpdate = async data => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/v1/races/interested`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
          'content-type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        const result = await response.json()
        const { status, data: { modifiedCount }, } = result
        return status === 'ok' && modifiedCount > 0
      } else {
        throw new Error('Network response was not ok. Unable to update interested racers. ')
      }
    } catch (err) {
      error.value = err.toString()
    }
  }

  const handleExpand = raceId => {
    const raceIndex = races.value.findIndex(element => element._id === raceId)
    const expand = races.value[raceIndex].expand
    races.value[raceIndex].expand = !expand
  }

  const handleGoing = async raceId => {
    const setGoing = userIsGoingIds.value.findIndex(element => element === raceId) === -1
    const wasUpdated = setGoing ? await createGoing(raceId) : await deleteGoing(raceId)
    if (wasUpdated) {
      updateRacesGoing(raceId)
      if (setGoing && userIsInterestedIds.value.findIndex(element => element === raceId) !== -1) {
        handleInterested(raceId)
      }
    }
  }

  const handleInterested = async raceId => {
    const setInterested = userIsInterestedIds.value.findIndex(element => element === raceId) === -1
    const wasUpdated = setInterested ? await createInterested(raceId) : await deleteInterested(raceId)
    if (wasUpdated) {
      updateRacesInterested(raceId)
      if (setInterested && userIsGoingIds.value.findIndex(element => element === raceId) !== -1) {
        handleGoing(raceId)
      }
    }
  }

  const updateRacesGoing = async raceId => {
    const raceIndex = races.value.findIndex(item => item._id === raceId)
    const result = await fetchGoingById(raceId)
      const { status } = result
      if (status === 'ok') {
        const { data: [ { goingNames } ] } = result
        races.value[raceIndex].goingNames = goingNames
      }
  }

  const updateRacesInterested = async raceId => {
    const raceIndex = races.value.findIndex(item => item._id === raceId)
    const result = await fetchInterestedById(raceId)
      const { status } = result
      if (status === 'ok') {
        const { data: [ { interestedNames } ] } = result
        races.value[raceIndex].interestedNames = interestedNames
      }
  }

  const userIsGoingIds = computed(() => {
    const racesIsGoing = races.value.map(element => {
      return element.goingNames.findIndex(item => item._id === sub.value) !== -1 ? element._id : null
    })
    return racesIsGoing
  })

  const userIsInterestedIds = computed(() => {
    const racesIsInterested = races.value.map(element => {
      return element.interestedNames.findIndex(item => item._id === sub.value) !== -1 ? element._id : null
    })
    return racesIsInterested
  })
</script>

<template>
  <div class="races">
    <v-row>
      <v-col cols="12" sm="6" lg="4" xl="3"
        v-for="{ _id, raceName, raceUrl, date, city, state, goingNames, interestedNames, promoterNames, expand } in races"
        :key="_id"
      >
        <v-card
          class="mt-16"
          width="340"
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
          <div class="py-2 d-flex justify-space-around align-center">
            <div class="d-inline-block">
              <v-switch
                color="indigo"
                :model-value="userIsGoingIds.findIndex(element => element === _id) !== -1 ? true : false"
                @click="handleGoing(_id)"
              >
                <template #label>
                  Attending
                </template>
              </v-switch>
            </div>
            <div class="d-inline-block">
              <v-switch
                color="indigo"
                :model-value="userIsInterestedIds.findIndex(element => element === _id) !== -1 ? true : false"
                @click="handleInterested(_id)"
              >
                <template #label>
                  Interested
                </template>
              </v-switch>
            </div>
          </div>
          <v-expand-transition>
            <div v-if="expand">
              <div class="going">
                <div class="text-subtitle-2 px-4 pb-2">
                  Who's Going?
                </div>
                <div v-if="goingNames.length > 0">
                  <div class="item text-body-2 px-4 pb-1" v-for="({ firstName, lastName }, index) in goingNames " :key="index">
                    {{ firstName }}&nbsp;{{ lastName }}
                  </div>
                </div>
                <div v-else>
                  <div class="item text-body-2 px-4 pb-1">
                    Nobody
                  </div>
                </div>
              </div>
              <div class="interested">
                <div class="text-subtitle-2 px-4 pb-2">
                  Who's Interested?
                </div>
                <div v-if="interestedNames.length > 0">
                  <div class="item text-body-2 px-4 pb-1" v-for="({ firstName, lastName }, index) in interestedNames " :key="index">
                    {{ firstName }}&nbsp;{{ lastName }}
                  </div>
                </div>
                <div v-else>
                  <div class="item text-body-2 px-4 pb-1">
                    Nobody
                  </div>
                </div>
              </div>
            </div>
          </v-expand-transition>
          <v-divider />
          <template #actions>
            <v-btn @click="handleExpand(_id)">
              {{ !expand ? 'Show Racers' : 'Hide Racers' }}
            </v-btn>
          </template>
        </v-card>
      </v-col>
    </v-row>
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