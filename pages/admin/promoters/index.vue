<script setup>
  import { ref } from 'vue'
  import { storeToRefs } from 'pinia'

  definePageMeta({
    middleware: ['auth-role-user']
  })

  const config = useRuntimeConfig()

  const { error: e, isLoading: il, fetchResult: fr } = await useFetchPost(null, config, { refreshToken: 'none' }, 'fetch grant type refresh token failed', 'api/v1/auth/token/grant-type/refresh-token')
  console.log(JSON.stringify(fr.value, null, 5))

  const alertType = ref('')
  const alertDescription = ref('')
  const dialogMessage = ref('')
  const dialogTitle = ref('')
  const idToDelete = ref('')
  const showAlert = ref(false)
  const showDialog = ref(false)

  const authStore = useAuthStore()

  const { currentJWT: accessToken, role, sub } = storeToRefs(authStore)

  const endpoint = role.value === 'user' ? `api/v1/promoters/owner/id/${sub.value}` : 'api/v1/promoters'
  const errorMessage = 'unable to fetch promoters'

  const { error, isLoading, fetchResult, refresh } = await useFetchGet(null, config, errorMessage, endpoint)

  const handleAddPromoter = () => {
    navigateTo({ path: '/admin/promoters/add' })
  }

  const handleDeletePromoter = event => {
    const { _id, promoterName} = event
    dialogMessage.value = `Do you really want to delete ${promoterName}?`
    dialogTitle.value = `Delete ${promoterName}`
    idToDelete.value = _id
    showDialog.value = true
  }

  const deletePromoter = async _id => {
    showDialog.value = false

    const data = { id: _id }
    const errorMsg = 'Promoter was not deleted. '
    const endpointDelete = 'api/v1/promoters'

    const { error, isLoading, fetchResult } = await useFetchDelete(accessToken.value, config, data, errorMsg, endpointDelete)

    if (error.value) {
      alertType.value = 'error'
      alertDescription.value = error.value
      showAlert.value = true
    } else if (fetchResult.value.status === 'ok' && fetchResult.value.data.ok === 1) {
      const { data: { value: { promoterName }, }, } = fetchResult.value
      alertType.value = 'success'
      alertDescription.value = `Great success, the promoter "${promoterName}" was deleted from the database.`
      showAlert.value = true
      setTimeout(() => { showAlert.value = false }, 5000)
      refresh(config, endpoint)
    }
  }
</script>

<template>
  <NuxtLayout>
    <div class="promoters">
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
            <v-btn color="primary" @click="deletePromoter(idToDelete)">
              Delete
            </v-btn>
            <v-btn color="grey-darken-2" @click="showDialog = false">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <h2 class="pt-3">
        Promoters
      </h2>
      <div class="promoters-actions py-6">
        <v-btn 
          prepend-icon="mdi-plus-circle-outline"
          @click="handleAddPromoter"
        >
          Add Promoter
        </v-btn>
      </div>
      <div class="promoter-alert" v-if="showAlert">
        <v-alert
          prominent
          variant="outlined"
          :type="alertType"
        >
          {{ alertDescription }}
        </v-alert>
      </div>
      <div class="promoters-list pt-3 pb-12">
        <div v-if="isLoading" class="d-flex justify-center pt-16">
          <v-progress-circular
            color="indigo"
            indeterminate
            :size="150"
            :width="8"
          />
        </div>
        <div v-else>
          <TablePromotersAdmin
            v-if="fetchResult.status === 'ok'"
            :data="fetchResult.data"
            @delete-promoter="handleDeletePromoter($event)"
          />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
