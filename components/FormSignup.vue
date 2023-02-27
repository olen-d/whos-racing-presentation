<script setup>
  import { computed, ref } from 'vue'

  const config = useRuntimeConfig()

  const props = defineProps({
    formCopy: {
      type: String,
      default: 'Create an account to see who\'s racing and update your status.'
    },
    formName: {
      type: String,
      default: 'Sign Up'
    },
    submitButtonAction: {
      type: String,
      default: 'Sign Up'
    }
  })

  const alertType = ref('')
  const alertTitle = ref('')
  const alertDescription = ref('')
  const formValues = ref([])
  const isError = ref(false)
  const serverErrors = ref({})
  const showAlert = ref(false)

  const authStore = useAuthStore()
  const router = useRouter()

  const getFormErrorsChanged = () => {
    const formErrorsChanged = formValues.value.filter(element => {
      return element.isChanged === true && element.isValid === false
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
          `${config.apiBaseUrl}/api/v1/users/guest`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          }
        )

        const result = response.ok ? await response.json() : null

        if (result && result.status === 'ok') {

          // Get the public key to verify the token
          const responsePublicKey = await fetch(`${config.apiBaseUrl}/api/v1/auth/token/public-key`)
          const resultPublicKey = await responsePublicKey.json()
          const { status } = responsePublicKey

          if (status === 200) {
            const { data: { publicKey } } = resultPublicKey
            const { data: { accessToken, refreshToken, tokenType } } = result

            authStore.publicKey = publicKey

            if (tokenType === 'bearer') {
              authStore.currentJWT = accessToken
              authStore.currentRefreshToken = refreshToken

              const isValidAccessToken = await verifyBearerToken(accessToken, publicKey)
              if (isValidAccessToken) {
                await navigateTo({ path: '/' })
              } // An unverified token will throw and error that will get caught in the catch block
            }
          } else {
            // Fail - TODO: this should be some kind of generic catch-all, since the status should either be created or error
          }
        } else if (result && result.status === 'error') {
          const { message, type } = result

          switch (type) {
            case 'validation':
              const { validationResults } = result

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
      } catch (error) {
        alertType.value='error'
        alertDescription.value = 'The server appears to be down. Please try again in a few minutes.' + error
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
      showAlert.value = false
    }
  }

  const isDisabled = computed(() => {
    const formErrors = getFormErrorsChanged()
    const formErrorsNotChanged = getFormErrorsNotChanged()
    return formErrors.length > 0 || formErrorsNotChanged.length > 0
  })
</script>

<template>
  <div class="form-signup">
    <v-sheet width="340" class="mt-16 mx-auto">
      <h3>
        {{ formName }}
      </h3>
      <p class="form-signup-copy" v-if="formCopy">
        {{ formCopy }}
      </p>
      <div class="form-signup-alert" v-if="showAlert">
        <v-alert
          prominent
          variant="outlined"
          :title="alertTitle"
          :type="alertType"
        >
          <template #text>
            {{ alertDescription }}
          </template>
        </v-alert>
      </div>
      <form>
        <FormFieldsInputName
          error-message="Please enter a valid first name"
          input-name="firstName"
          labeltext="First Name"
          placeholder="Enter your first name..."
          :is-server-error="serverErrors.firstName"
          :required=true
          @change-form-values="updateFormValues($event)"
          @remove-form-values="removeFormValues($event)"
        />
        <FormFieldsInputName
          error-message="Please enter a valid last name"
          input-name="lastName"
          labeltext="Last Name"
          placeholder="Enter your last name..."
          :is-server-error="serverErrors.lastName"
          :required=true
          @change-form-values="updateFormValues($event)"
          @remove-form-values="removeFormValues($event)"
        />
        <FormFieldsInputEmail
          hint="Your email address will be used to reset your password if needed."
          input-name="emailAddress"
          :is-server-error="serverErrors.emailAddress"
          :required=true
          @change-form-values="updateFormValues($event)"
          @remove-form-values="removeFormValues($event)"
        />
        <FormFieldsInputUsername
          :is-server-error="serverErrors.username"
          :required=true
          @change-form-values="updateFormValues($event)"
          @remove-form-values="removeFormValues($event)"
        />
        <FormFieldsInputPassword
          hint="Passwords must be at least eight characters long, with one uppercase and one lowecase letter and at least one number or special character."
          input-name="plaintextPassword"
          :is-server-error="serverErrors.plaintextPassword"
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
    <!-- <p>
      <router-link to="/login/request-password-reset">
        Forgot your password?
      </router-link>
    </p> -->
  </div>
</template>

<style scoped>
  .form-signup-alert {
    margin-top: 2rem;
    margin-bottom: 3rem;
  }
  .form-signup-copy {
    margin-bottom: 1rem;
  }
  h3 {
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
</style>
