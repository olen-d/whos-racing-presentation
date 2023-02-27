<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { storeToRefs } from 'pinia'

  const config = useRuntimeConfig()

  const props = defineProps({
    formAction: {
      type: String,
      default: 'add'
    },
    formCopy: {
      type: String,
      default: null
    },
    formName: {
      type: String,
      default: 'Race'
    },
    submitButtonAction: {
      type: String,
      default: 'Add Race'
    }
  })

  const alertDescription = ref('')
  const alertTimeout = ref(0)
  const alertType = ref('')
  const alertTitle = ref('')
  const formValues = ref([])
  const isError = ref(false)
  const promotersList = ref([])
  const serverErrors = ref({})
  const showAlert = ref(false)
  const shouldClearInputs = ref(false)

  const authStore = useAuthStore()

  const { currentJWT: accessToken } = storeToRefs(authStore)

  onMounted(async () => {
    const endpoint = 'api/v1/promoters'

    const { error, isLoading, fetchResult } = await useFetchGet(config, endpoint)
    if (fetchResult.value.status === 'ok') {
      const promoters = fetchResult.value.data.map(({ _id, promoterName }) => ({ _id, promoterName }))
      promotersList.value = promoters
    }
  })

  const clearForm = () => {
    shouldClearInputs.value = true
  }

  const getFormErrorsChanged = () => {
    const formErrorsChanged = formValues.value.filter(element => {
      return element.isChanged !== false && element.isValid === false
    })
    return formErrorsChanged
  }

  const getFormErrorsNotChanged = () => {
    const formErrorsNotChanged = formValues.value.filter(element => {
      return element.isChanged === false && element.isValid === false
    })
    return formErrorsNotChanged
  }

  const handleSubmit = async () => {
    const formErrors = getFormErrorsChanged()

    if (formErrors.length > 0) {
      updateFormErrors(formErrors)
      return
    } else {

      // Submit
      const data = {}
      const errorMsg = 'Race was not created. '

      formValues.value.forEach(element => {
        const { inputName, inputValue } = element
        data[inputName] = inputValue
      })

      const endpoint = 'api/v1/races'

      const { error, isLoading, fetchResult } = await useFetchPost(accessToken.value, config, data, errorMsg, endpoint)

      if (error.value) {
        alertType.value = 'error'
        alertDescription.value = error.value
        showAlert.value = true
      } else if (fetchResult.value.status === 'ok' && fetchResult.value.data.acknowledged === true) {
        alertType.value = 'success'
        alertDescription.value = 'Great success, the race was added to the database. '
        showAlert.value = true
        clearForm()
        setTimeout(() => { showAlert.value = false }, 5000)
      } else if (fetchResult.value.status === 'error') {
        const { message, type } = fetchResult.value

        switch (type) {
          case 'validation':
            const { validationResults } = fetchResult.value

            validationResults.forEach(element => {
              const {inputName, isValid } = element
                if (!isValid) {
                  serverErrors.value[inputName] = true
                }
            })
            break
        }
        alertType.value='error'
        isError.value = true
        showAlert.value = true
      }
    }
  }

  const removeFormValues = event => {
    const { inputName: name } = event
    const valuesIndex = formValues.value.findIndex(element => element.inputName === name)
    formValues.value.splice(valuesIndex, 1) // Mutates formValues
    if (formValues.value.length === 0) { shouldClearInputs.value = false }
  }

  const updateFormValues = event => {
    const { inputName: name } = event
    const valuesIndex = formValues.value.findIndex(element => element.inputName === name)
    if (valuesIndex === -1) {
      formValues.value.push(event)
    } else {
      formValues.value[valuesIndex] = event
    }
    const formErrors = getFormErrorsChanged()
    updateFormErrors(formErrors)
  }

  const updateFormErrors = formErrors => {
    if (formErrors.length > 0) {
      const errorMessages = formErrors.map(element => {
        return element.errorMessage
      })
      alertDescription.value = errorMessages.join('. ') + '.'

      const numberAgreement = formErrors.length === 1 ? 'An Error' : 'Errors'
      alertTitle.value = `The ${props.formName} Form Has ${numberAgreement}`

      isError.value = true
    } else {
      isError.value = false
      alertDescription.value = ''
      alertTitle.value = ''
    }
  }

  const isDisabled = computed(() => {
    const formErrors = getFormErrorsChanged()
    const formErrorsNotChanged = getFormErrorsNotChanged()
    return formErrors.length > 0 || formErrorsNotChanged.length > 0
  })
</script>

<template>
  <div class="form-race">
    <v-row>
      <v-col cols="12">
        <h3>
          <span class="text-capitalize">{{ formAction }}</span> a {{ formName }}
        </h3>
        <p class="form-race-copy" v-if="formCopy">
          {{ formCopy }}
        </p>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <div class="form-race-alert" v-if="showAlert">
          <v-alert
            prominent
            variant="outlined"
            :type="alertType"
          >
            {{ alertDescription }}
          </v-alert>
        </div>
      </v-col>
    </v-row>
    <form>
      <v-row>
        <v-col cols="12" sm="6">
          <FormFieldsInputName
            error-message="Please enter a valid race name"
            input-name="raceName"
            labeltext="Race Name"
            placeholder="Enter the name of the race..."
            :is-server-error="serverErrors.raceName"
            :required=true
            :shouldClearInput="shouldClearInputs"
            @change-form-values="updateFormValues($event)"
            @remove-form-values="removeFormValues($event)"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <FormFieldsInputURL
            input-name="raceUrl"
            labeltext="Race Link"
            placeholder="Enter the link URL to the race web page..."
            :is-server-error="serverErrors.raceUrl"
            :required=true
            :shouldClearInput="shouldClearInputs"
            @change-form-values="updateFormValues($event)"
            @remove-form-values="removeFormValues($event)"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6">
          <FormFieldsInputCity
            input-name="city"
            labeltext="Race City"
            placeholder="Enter the city the race starts in..."
            :is-server-error="serverErrors.city"
            :required=true
            :shouldClearInput="shouldClearInputs"
            @change-form-values="updateFormValues($event)"
            @remove-form-values="removeFormValues($event)"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <FormFieldsInputState
            input-name="state"
            labeltext="Race State"
            placeholder="Enter the state the race starts in..."
            :is-server-error="serverErrors.state"
            :required=true
            :shouldClearInput="shouldClearInputs"
            @change-form-values="updateFormValues($event)"
            @remove-form-values="removeFormValues($event)"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6">
          <FormFieldsInputDateTime
            input-name="date"
            labeltext="Race Date and Start Time"
            :is-server-error="serverErrors.date"
            :required="true"
            :shouldClearInput="shouldClearInputs"
            @change-form-values="updateFormValues($event)"
            @remove-form-values="removeFormValues($event)"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <FormFieldsSelectGeneric
            error-message="Please select a race promoter"
            input-name="promoterId"
            item-title="promoterName"
            item-value="_id"
            labeltext="Race Promoter"
            :is-server-error="serverErrors.promoterId"
            :items="promotersList"
            :persistent-hint="false"
            @change-form-values="updateFormValues($event)"
            @remove-form-values="removeFormValues($event)"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6">
          <v-btn
            :disabled = "isDisabled"
            @click.prevent="handleSubmit"
            color="primary"
          >
            {{ submitButtonAction }}
          </v-btn>
        </v-col>
        <v-col cols="6">
          &nbsp;
        </v-col>
      </v-row>
    </form>
  </div>
</template>

<style scoped>
  .form-race-alert {
    margin-top: 2rem;
    margin-bottom: 3rem;
  }
  .form-race-copy {
    margin-bottom: 1rem;
  }
  h3 {
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
</style>
