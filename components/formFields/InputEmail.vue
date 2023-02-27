<script setup>
  import { onMounted, ref, watch } from 'vue'

  const config = useRuntimeConfig()

  const props = defineProps({
    errorMessage: {
      type: String,
      default: 'Please enter a valid email address'
    },
    hint: {
      type: String,
      default: null
    },
    initialValue: {
      type: String,
      default: null
    },
    inputName: {
      type: String,
      default: 'email'
    },
    isServerError: {
      type: Boolean,
      default: false
    },
    labeltext: {
      type: String,
      default: 'Email Address'
    },
    placeholder: {
      type: String,
      default: 'Enter your email address...'
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

  const checkMx = async emailAddress => {
    try {
      const result = await fetch(
        `${config.apiBaseUrl}/api/v1/mail/check-mx/${emailAddress}`
      )
      const data = await result.json()
      const { mxExists } = data

      return mxExists ? true : false
    } catch {
      return false
    }
  }

  const emitChange = () => {
    emits('changeFormValues', { inputName: props.inputName, inputValue: inputValue.value, isChanged: changedState.isChanged, isValid: isValid.value, errorMessage: props.errorMessage })
  }

  const handleBlur = async () => {
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

  const validate = async value => {
    const expression = /.+@.+\..+/i
    const isValidFormat = expression.test(String(value).toLowerCase())

    if (isValidFormat) {
      return await checkMx(value)
    } else {
      return false
    }
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
  <div class="input-email mb-2">
    <v-text-field
      v-model="inputValue"
      clearable
      type="email"
      :error-messages="errorMessages"
      :hint="hint"
      :label="labeltext"
      :placeholder="placeholder"
      :required="required"
      @blur="handleBlur"
    >
    <template #label>
        <span :class="validationStatus">
          {{ labeltext }}
        </span>
      </template>
    </v-text-field>
  </div>
</template>
