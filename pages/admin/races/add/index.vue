<script setup>
  definePageMeta({
    middleware: ['auth-role-user']
  })
</script>

<template>
  <NuxtLayout>
    <div class="races-add">
      <div class="form-race">
        <FormRace/>
      </div>
    </div>
  </NuxtLayout>
</template>
