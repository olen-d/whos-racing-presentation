<script setup>
  import { onMounted, ref, watch } from 'vue'

  // Lodash is a CommonJS module
  import pkgLodash from 'lodash'
  const { debounce } = pkgLodash

  const props = defineProps({
    errorMessage: {
      type: String,
      default: 'Please enter a valid link URL'
    },
    initialValue: {
      type: String,
      default: null
    },
    inputName: {
      type: String,
      default: 'url'
    },
    isServerError: {
      type: Boolean,
      default: false
    },
    labeltext: {
      type: String,
      default: 'Link'
    },
    placeholder: {
      type: String,
      default: 'Enter the Link URL...'
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

  const handleChange = () => {
    if (!changedState.isChanged) {
      changedState.isChanged = true
    }
    isValid.value = validate(inputValue.value)
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

  const validate = value => {
    const urlRegEx = /^(http|https):\/\/[^ "]+$/ // Extremely simple, should prevent obvious errors
    const isValid = urlRegEx.test(value)
    return isValid
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
    <div class="input-url">
      <v-text-field
        v-model="inputValue"
        clearable
        type="url"
        :error-messages="errorMessages"
        :label="labeltext"
        :placeholder="placeholder"
        :required="required"
        @blur="handleBlur"
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
