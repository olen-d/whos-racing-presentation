<script setup>
  import { onMounted, ref, watch } from 'vue'

  const props = defineProps({
    errorMessage: {
      type: String,
      default: 'Please enter a valid date and time'
    },
    initialValue: {
      type: String,
      default: null
    },
    inputName: {
      type: String,
      default: 'date'
    },
    isServerError: {
      type: Boolean,
      default: false
    },
    labeltext: {
      type: String,
      default: 'Race Date and Start Time'
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
  const changedStateDate = { isChanged: false }
  const changedStateTime = { isChanged: false }
  const errorMessages = ref('')
  const isValid = ref(false)
  const inputValue = ref('')
  const inputValueDate = ref('')
  const inputValueTime = ref('')
  const validationStatus = ref('')

  onMounted(() => {
    inputValue.value = props.initialValue
    emitChange()

    const currentDate = new Date()
    inputValueDate.value = getDateISO8601(currentDate)
    inputValueTime.value = getTime(currentDate)
  })

  const emitChange = () => {
    emits('changeFormValues', { inputName: props.inputName, inputValue: inputValue.value, isChanged: changedState.isChanged, isValid: isValid.value, errorMessage: props.errorMessage })
  }

  const handleBlurDate = () => {
    isValid.value = true
    if (!changedStateDate.isChanged) {
      changedStateDate.isChanged = true
    }
    if (!changedState.isChanged) {
      changedState.isChanged = true
    }
    if (inputValueTime.value) {
      const unixTimestampMs = Date.parse(`${inputValueDate.value}T${inputValueTime.value}:00`)
      inputValue.value = unixTimestampMs
      emitChange()
    }
  }

  const handleBlurTime = () => {
    isValid.value = true
    if (!changedStateTime.isChanged) {
      changedStateTime.isChanged = true
    }
    if (!changedState.isChanged) {
      changedState.isChanged = true
    }
    if (inputValueDate.value) {
      const unixTimestampMs = Date.parse(`${inputValueDate.value}T${inputValueTime.value}:00`)
      inputValue.value = unixTimestampMs
      emitChange()
    }
  }

  const getDateISO8601 = date => {
    const yearFullLocal = date.getFullYear()
    const monthLocal = date.getMonth() + 1
    const dateLocal = date.getDate()
    return `${yearFullLocal}-${leadingZero(monthLocal)}${monthLocal}-${dateLocal}`
  }

  const getTime = date => {
    const hoursLocal = date.getHours()
    const minutesLocal = date.getMinutes()
    return `${leadingZero(hoursLocal)}${hoursLocal}:${leadingZero(minutesLocal)}${minutesLocal}`
  }

  const leadingZero = value => {
    return value < 10 ? '0' : ''
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
      inputValueDate.value = null
      inputValueTime.value = null
      changedState.isChanged = false
      changedStateDate.isChanged = false
      changedStateTime.isChanged = false
      isValid.value = false
      emits('removeFormValues', { inputName: props.inputName, inputValue: inputValue.value, isChanged: changedState.isChanged, isValid: isValid.value, errorMessage: props.errorMessage })
    }
  })
</script>

<template>
  <div class="native-datetime-picker">
    <div class="d-inline-block w-50">
      <input
        class="w-100 px-3 pad-special rounded-t-sm text-grey-darken-1 bg-grey-lighten-4"
        v-model="inputValueDate"
        type="date"
        @blur="handleBlurDate"
      />
    </div>
    <div class="d-inline-block w-50">
      <input
        class="w-100 px-3 pad-special rounded-t-sm text-grey-darken-1 bg-grey-lighten-4"
        v-model="inputValueTime"
        type="time"
        @blur="handleBlurTime"
      />
    </div>
  </div>
</template>

<style scoped>
  input[type="date"], input[type="time"] {
    appearance: none;
    -webkit-appearance: none;
    display: inline-block !important;
    border-bottom: 1px solid #9e9e9e;
    visibility: visible !important;
  }

  .pad-special {
    padding-top: 15px;
    padding-bottom: 14px;
  }
</style>