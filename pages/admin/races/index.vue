<script setup>
  import { ref } from 'vue'
  import { storeToRefs } from 'pinia'

  definePageMeta({
    middleware: ['auth-role-user']
  })

  const config = useRuntimeConfig()
 
  const alertType = ref('')
  const alertDescription = ref('')
  const dialogMessage = ref('')
  const dialogTitle = ref('')
  const idToDelete = ref('')
  const showAlert = ref(false)
  const showDialog = ref(false)

  const authStore = useAuthStore()

  const { currentJWT: accessToken, role, sub } = storeToRefs(authStore)

  const endpoint = role.value === 'user' ? `api/v1/races/owner/id/${sub.value}` : 'api/v1/races'
  const errorMessage = 'unable to fetch races'

  const { error, isLoading, fetchResult, refresh } = await useFetchGet(null, config, errorMessage, endpoint)

  const handleAddRace = () => {
    navigateTo({ path: '/admin/races/add' })
  }

  const handleDeleteRace = event => {
    const { _id, raceName} = event
    dialogMessage.value = `Do you really want to delete ${raceName}?`
    dialogTitle.value = `Delete ${raceName}`
    idToDelete.value = _id
    showDialog.value = true
  }

  const deleteRace = async _id => {
    showDialog.value = false

    const data = { id: _id }
    const errorMsg = 'Race was not deleted. '
    const endpointDelete = 'api/v1/races'

    const { error, isLoading, fetchResult } = await useFetchDelete(accessToken.value, config, data, errorMsg, endpointDelete)

    if (error.value) {
      alertType.value = 'error'
      alertDescription.value = error.value
      showAlert.value = true
    } else if (fetchResult.value.status === 'ok' && fetchResult.value.data.ok === 1) {
      const { data: { value: { raceName }, }, } = fetchResult.value
      alertType.value = 'success'
      alertDescription.value = `Great success, the race "${raceName}" was deleted from the database.`
      showAlert.value = true
      setTimeout(() => { showAlert.value = false }, 5000)
      refresh(config, endpoint)
    }
  }
</script>

<template>
  <NuxtLayout>
    <div class="races">
      <v-dialog
        v-model="showDialog"
        width="auto"
      >
        <v-card>
          <template #title>
            <h4 class="text-center">{{ dialogTitle }}</h4>
          </template>
          <v-card-text>
            {{ dialogMessage }}
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" @click="deleteRace(idToDelete)">
              Delete
            </v-btn>
            <v-btn color="grey-darken-2" @click="showDialog = false">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <h2 class="pt-3">
        Races
      </h2>
      <div class="races-actions py-6">
        <v-btn 
          prepend-icon="mdi-plus-circle-outline"
          @click="handleAddRace"
        >
          Add Race
        </v-btn>
      </div>
      <div class="race-alert" v-if="showAlert">
        <v-alert
          prominent
          variant="outlined"
          :type="alertType"
        >
          {{ alertDescription }}
        </v-alert>
      </div>
      <div class="races-list pt-3 pb-12">
        <div v-if="isLoading" class="d-flex justify-center pt-16">
          <v-progress-circular
            color="indigo"
            indeterminate
            :size="150"
            :width="8"
          />
        </div>
        <div v-else>
          <TableRacesAdmin
            v-if="fetchResult.status === 'ok'"
            :data="fetchResult.data"
            @delete-race="handleDeleteRace($event)"
          />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
