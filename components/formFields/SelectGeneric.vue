<script setup>
  import { onMounted, ref, watch } from 'vue'
  import { debounce } from 'lodash'

  const props = defineProps({
    errorMessage: {
      type: String,
      default: 'Please select an item'
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
      default: 'selectGeneric'
    },
    isServerError: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array,
      required: true
    },
    itemTitle: {
      type: String,
      default: 'title'
    },
    itemValue: {
      type: String,
      default: 'value'
    },
    labeltext: {
      type: String,
      default: 'Select'
    },
    persistentHint: {
      type: Boolean,
      default: true
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
  const inputValue = ref(null)
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

  const handleChange = event => {

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

  const handleInput = () => {
    handleChange()
  }

  const validate = promoter => {
    const isValid = typeof promoter === 'string' && promoter.length > 0
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
  <div class="select-generic-multiple">
    <v-select
      v-model="inputValue"
      :error-messages="errorMessages"
      :hint="hint"
      :items="items"
      :item-title="itemTitle"
      :item-value="itemValue"
      :persistentHint="persistentHint"
      :required="required"
      @blur="handleBlur"
      @update:model-value="handleInput"
    >
    <template #label>
        <span :class="validationStatus">
          {{ labeltext }}
        </span>
      </template>
    </v-select>
  </div>
</template>
