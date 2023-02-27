<script setup>
  const props = defineProps({
    data: {
      type: Array,
      required: true
    }
  })

  const emits = defineEmits(['deletePromoter'])
</script>

<template>
  <div class="table-promoters-admin">
    <v-table>
      <thead>
        <tr>
          <th class="text-body-2">
            Promoter Name
          </th>
          <th class="text-body-2">
            Promoter URL
          </th>
          <th class="text-body-2">
            &nbsp;
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="{ _id, promoterName, promoterUrl } in data" :key="_id">
          <td class="text-body-2">{{ promoterName }}</td>
          <td class="text-body-2">{{ promoterUrl }}</td>
          <td><v-icon @click="emits('deletePromoter', { _id, promoterName })">mdi-trash-can-outline</v-icon></td>
        </tr>
      </tbody>
    </v-table> 
  </div>
</template>
