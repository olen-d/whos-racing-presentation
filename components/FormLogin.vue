<script setup>
  import { computed, ref } from 'vue'

  const config = useRuntimeConfig()

  const props = defineProps({
    formCopy: {
      type: String,
      default: 'See who\'s racing and update your status.'
    },
    formName: {
      type: String,
      default: 'Sign In'
    },
    submitButtonAction: {
      type: String,
      default: 'Sign In'
    }
  })

  const alertType = ref('')
  const alertDescription = ref('')
  const errorDescription = ref('')
  const errorTitle = ref('')
  const formValues = ref([])
  const isError = ref(false)
  const showAlert = ref(false)

  const authStore = useAuthStore()
  const router = useRouter()

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

      formValues.value.forEach(element => {
        const { inputName, inputValue } = element
        data[inputName] = inputValue
      })

      try {
        const response = await fetch(
          `${config.apiBaseUrl}/api/v1/auth/token/grant-type/password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
          }
        )

        const result = response.ok ? await response.json() : null
        if (result && result.status === 'ok') {
          // Get the public key to verify the token
          const responsePublicKey = await fetch(`${config.apiBaseUrl}/api/v1/auth/token/bearer/public-key`)
          const resultPublicKey = await responsePublicKey.json()
          const { status } = responsePublicKey

          if (status === 200) {
            const { data: { publicKey } } = resultPublicKey
            const { data: { accessToken, refreshToken, tokenType } } = result

            authStore.bearerTokenPublicKey = publicKey

            if (tokenType === 'bearer') {
              authStore.currentJWT = accessToken
              authStore.currentRefreshToken = refreshToken

              const isValidAccessToken = await verifyBearerToken(accessToken, publicKey)
              if (isValidAccessToken) {
                const expiration = new Date()
                expiration.setDate(expiration.getDate() + 30)

                const refreshTokenCookie = useCookie('refreshToken', { domain: config.cookieDomain, expires: expiration, httpOnly: true, path: '/' }) // , path: '/api/v1/auth/token/grant-type/refresh-token'  secure: true
                refreshTokenCookie.value = refreshToken
  
                await navigateTo({ path: '/' })
              } // An unverified token will throw and error that will get caught in the catch block
            }
          } else {
            // Fail - TODO: this should be some kind of generic catch-all, since the status should either be created or error
          }
        } else {
          const { status } = response
          switch (status) {
            case 404:
              alertDescription.value = 'Unable to sign in. Please verify your username and password are correct and try again.'
              break
            default:
              alertDescription.value = 'One or more required fields were not submitted to the server. Please try again in a few minutes.'
          }
          alertType.value="error"
          isError.value = true
          showAlert.value = true
        }
      } catch (error) {
        alertType.value="error"
        alertDescription.value = 'The server appears to be down. Please try again in a few minutes.'
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
      errorDescription.value = errorMessages.join('. ') + '.'

      const numberAgreement = formErrors.length === 1 ? 'An Error' : 'Errors'
      errorTitle.value = `The ${props.formName} Form Has ${numberAgreement}`

      isError.value = true
    } else {
      isError.value = false
      errorDescription.value = ''
      errorTitle.value = ''
    }
  }

  const isDisabled = computed(() => {
    const formErrors = getFormErrorsChanged()
    const formErrorsNotChanged = getFormErrorsNotChanged()
    return formErrors.length > 0 || formErrorsNotChanged.length > 0
  })
</script>

<template>
  <div class="form-login">
    <v-sheet width="340" class="mt-16 mx-auto">
      <h3>
        {{ formName }}
      </h3>
      <p class="form-login-copy" v-if="formCopy">
        {{ formCopy }}
      </p>
      <div class="form-login-alert" v-if="showAlert">
        <v-alert
          prominent
          variant="outlined"
          :type="alertType"
        >
          {{ alertDescription }}
        </v-alert>
      </div>
      <form>
        <FormFieldsInputUsername
          :required=true
          @change-form-values="updateFormValues($event)"
          @remove-form-values="removeFormValues($event)"
        />
        <FormFieldsInputPassword
          input-name="plaintextPassword"
          :required=true
          @change-form-values="updateFormValues($event)"
          @remove-form-values="removeFormValues($event)"
        />
        <v-btn
          :disabled="isDisabled"
          @click.prevent="handleSubmit"
          color="primary"
        >
          {{ submitButtonAction }}
        </v-btn>
      </form>
    </v-sheet>
    <v-row>
      <v-col cols="2" md="3" lg="4" class="d-none d-sm-flex">
        &nbsp;
      </v-col>
      <v-col cols="12" sm="8" md="6" lg="4">



      </v-col>
      <v-col cols="2" md="3" lg="4" class="d-none d-sm-flex">
        &nbsp;
      </v-col>
    </v-row>
    <!-- <p>
      <router-link to="/login/request-password-reset">
        Forgot your password?
      </router-link>
    </p> -->
  </div>
</template>

<style scoped>
  .form-login-alert {
    margin-top: 2rem;
    margin-bottom: 3rem;
  }
  .form-login-copy {
    margin-bottom: 1rem;
  }
  h3 {
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
</style>
