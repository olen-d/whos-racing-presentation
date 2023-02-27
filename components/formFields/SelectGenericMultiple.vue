<script setup>
  import { onMounted, ref, watch } from 'vue'

  const props = defineProps({
    errorMessage: {
      type: String,
      default: 'Please select at least one item'
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
      default: 'selectGenericMultiple'
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

  const validate = promoters => {
    const isValid = Array.isArray(promoters) && promoters.length > 0
    return isValid
  }

  watch(() => props.initialValue, (newInitialValue, prevInitialValue) => {
    inputValue.value = newInitialValue
    changedState.isChanged = false
    isValid.value = false
    emitChange(props.inputName, inputValue.value)
  })

  watch(() => props.isServerError, (isServerError, prevIsServerError) => {
    if (isServerError) {
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
      multiple
      :error-messages="errorMessages"
      :hint="hint"
      :items="items"
      :item-title="itemTitle"
      :item-value="itemValue"
      :persistentHint="persistentHint"
      :required="required"
      @blur="handleBlur"
    >
    <template #label>
        <span :class="validationStatus">
          {{ labeltext }}
        </span>
      </template>
    </v-select>
  </div>
</template>