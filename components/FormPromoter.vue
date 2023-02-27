<script setup>
  import { computed, ref } from 'vue'
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
      default: 'Promoter'
    },
    submitButtonAction: {
      type: String,
      default: 'Add Promoter'
    }
  })

  const alertDescription = ref('')
  const alertTimeout = ref(0)
  const alertTitle = ref('')
  const alertType = ref('')
  const formValues = ref([])
  const isError = ref(false)
  const serverErrors = ref({})
  const showAlert = ref(false)
  const shouldClearInputs = ref(false)

  const authStore = useAuthStore()

  const { currentJWT: accessToken } = storeToRefs(authStore)

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
      const errorMsg = 'Promoter was not created. '

      formValues.value.forEach(element => {
        const { inputName, inputValue } = element
        data[inputName] = inputValue
      })

      const endpoint = 'api/v1/promoters'

      const { error, isLoading, fetchResult } = await useFetchPost(accessToken.value, config, data, errorMsg, endpoint)

      if (error.value) {
        alertType.value = 'error'
        alertDescription.value = error.value
        showAlert.value = true
      } else if (fetchResult.value.status === 'ok' && fetchResult.value.data.acknowledged === true) {
        alertType.value = 'success'
        alertDescription.value = 'Great success, the promoter was added to the database. '
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
            break;
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
      showAlert.value  = false
    }
  }

  const isDisabled = computed(() => {
    const formErrors = getFormErrorsChanged()
    const formErrorsNotChanged = getFormErrorsNotChanged()
    return formErrors.length > 0 || formErrorsNotChanged.length > 0
  })
</script>

<template>
  <div class="form-promoter">
    <v-row>
      <v-col cols="12" sm="8">
        <h3>
          <span class="text-capitalize">{{ formAction }}</span> a {{ formName }}
        </h3>
        <p class="form-promoter-copy" v-if="formCopy">
          {{ formCopy }}
        </p>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="8">
        <div class="form-promoter-alert" v-if="showAlert">
          <v-alert
            prominent
            variant="outlined"
            :title="alertTitle"
            :type="alertType"
          >
            {{ alertDescription }}
          </v-alert>
        </div>
      </v-col>
    </v-row>
    <form>
      <v-row>
        <v-col cols="12" sm="8">
          <FormFieldsInputName
            error-message="Please enter a valid promoter name"
            input-name="promoterName"
            labeltext="Promoter Name"
            placeholder="Enter the name of the race promoter..."
            :is-server-error="serverErrors.promoterName"
            :required=true
            :shouldClearInput="shouldClearInputs"
            @change-form-values="updateFormValues($event)"
            @remove-form-values="removeFormValues($event)"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="8">
          <FormFieldsInputURL
            input-name="promoterUrl"
            labeltext="Promoter Link"
            placeholder="Enter the link URL to the promoter's website..."
            :is-server-error="serverErrors.promoterUrl"
            :required=true
            :shouldClearInput="shouldClearInputs"
            @change-form-values="updateFormValues($event)"
            @remove-form-values="removeFormValues($event)"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="8">
          <v-btn
            :disabled = "isDisabled"
            @click.prevent="handleSubmit"
            color="primary"
          >
            {{ submitButtonAction }}
          </v-btn>
        </v-col>
      </v-row>
    </form>
  </div>
</template>

<style scoped>
  .form-promoter-alert {
    margin-top: 2rem;
    margin-bottom: 3rem;
  }
  .form-promoter-copy {
    margin-bottom: 1rem;
  }
  h3 {
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
</style>
