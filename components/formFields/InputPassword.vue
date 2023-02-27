<script setup>
import { onMounted, ref, watch } from 'vue'
import { debounce } from 'lodash'

  const props = defineProps({
    errorMessage: {
      type: String,
      default: 'Please enter a valid password. Passwords must be at least eight characters long, with one uppercase and one lowecase letter and at least one number or special character'
    },
    hint: {
      type: String,
      default: null
    },
    initialValue: {
      type: String,
      default: ''
    },
    inputName: {
      type: String,
      default: 'password'
    },
    isServerError: {
      type: Boolean,
      default: false
    },
    labeltext: {
      type: String,
      default: 'Password'
    },
    placeholder: {
      type: String,
      default: 'Enter your password...'
    },
    required: {
      type: Boolean,
      default: false
    },
    shouldClearInput: {
      type: Boolean,
      default: false
    }
  })

  const emits = defineEmits(['changeFormValues', 'removeFormValues'])

  const changedState = { isChanged: false }
  const errorMessages = ref('')
  const isValid = ref(false)
  const inputValue = ref('')
  const validationStatus = ref('')

  onMounted(() => {
    inputValue.value = props.initialValue
    emitChange()
  })

  const emitChange = () => {
    emits('changeFormValues', { inputName: props.inputName, inputValue: inputValue.value, isChanged: changedState.isChanged, isValid: isValid.value, errorMessage: props.errorMessage })
  }

  const handleBlur = () => {
    handleChange()
  }

  const handleChange = async () => {
    if (!changedState.isChanged) {
      changedState.isChanged = true
    }
    isValid.value = await validate(inputValue.value)
    if (isValid.value) {
      errorMessages.value = ''
      validationStatus.value = null
    } else {
      errorMessages.value = props.errorMessage
      validationStatus.value = 'text-error'
    }
    emitChange()
  }

  const handleInput = debounce(() => {
    handleChange()
  }, 500)

  /**
   * Validate that a potential password meets minimum requirements
   * @author Olen Daelhousen <portfolio@olen.dev>
   * @param {string} password - the password to be tested
   * @returns {Promise} Promise object represents true if the password passes validation or false if not
   */

  const validate = password => {
    return new Promise((resolve, reject) => {
      try {
        const oneUpper = /[A-Z]/
        const oneLower = /[a-z]/
        const oneDigit = /\d/
        const oneSpecial = /[!@#$%^&*()-+=]/

        const isOneUpper = oneUpper.test(password)
        const isOneLower = oneLower.test(password)
        const isOneDigit = oneDigit.test(password)
        const isOneSpecial = oneSpecial.test(password)
        const isLength = password?.length >= 8

        if (
          isOneUpper &&
          isOneLower &&
          (isOneDigit || isOneSpecial) &&
          isLength
        ) {
          resolve(true)
        } else {
          resolve(false)
        }
      } catch {
        reject(false)
      }
    })
  }

  watch(() => props.initialValue, (newInitialValue, prevInitialValue) => {
    inputValue.value = newInitialValue
    changedState.isChanged = false
    isValid.value = false
    emitChange(props.inputName, inputValue.value)
  })

  watch(() => props.isServerError, (newIsServerError, prevIsServerError) => {
    if (newIsServerError) {
      changedState.isChanged = true
      errorMessages.value = props.errorMessage
      validationStatus.value = 'text-error'
      isValid.value = false
      emitChange()
    }
  })

  watch(() => props.shouldClearInput, (newShouldClearInput, prevShouldClearInput) => {
    if (newShouldClearInput) {
      inputValue.value = null
      changedState.isChanged = false
      isValid.value = false
      emits('removeFormValues', { inputName: props.inputName, inputValue: inputValue.value, isChanged: changedState.isChanged, isValid: isValid.value, errorMessage: props.errorMessage })
    }
  })
</script>

<template>
  <div class="input-password mb-2">
    <v-text-field
      v-model="inputValue"
      clearable
      type="password"
      :error-messages="errorMessages"
      :hint="hint"
      :label="labeltext"
      :placeholder="placeholder"
      :required="required"
      @blur = "handleBlur"
      @input="handleInput"
    >
      <template #label>
        <span :class="validationStatus">
          {{ labeltext }}
        </span>
      </template>
    </v-text-field>
  </div>
</template>
