<script setup>
  definePageMeta({
    middleware: ['auth-role-user']
  })
</script>

<template>
  <NuxtLayout>
    <div class="promoters-add">
      <div class="form-promoter">
        <FormPromoter/>
      </div>
    </div>
  </NuxtLayout>
</template>
