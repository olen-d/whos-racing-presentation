<script setup>
  defineProps({
    data: {
      type: Array,
      required: true
    }
  })

  const emits = defineEmits(['deleteRace'])

  const formatDate = inputDate => {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(inputDate))
  }
</script>

<template>
  <div class="table-races-admin">
    <v-table>
      <thead>
        <tr>
          <th class="text-body-2">
            Race
          </th>
          <th class="text-body-2">
            Date
          </th>
          <th class="text-body-2">
            Location
          </th>
          <th class="text-body-2">
            Link
          </th>
          <th class="text-body-2">
            Promoter
          </th>
          <th class="text-body-2">
            &nbsp;
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="{ _id, raceName, raceUrl, date, city, state, promoterNames } in data" :key="_id">
          <td class="text-body-2">{{ raceName }}</td>
          <td class="text-body-2">{{ formatDate(date) }}</td>
          <td class="text-body-2">{{ city }},<br />{{ state }}</td>
          <td class="text-body-2"><span class="d-inline-block text-truncate" style="max-width: 12rem;">{{ raceUrl }}</span></td>
          <td class="text-body-2">{{ promoterNames[0].promoterName }}</td>
          <td class="text-body-2"><v-icon @click="emits('deleteRace', { _id, raceName })">mdi-trash-can-outline</v-icon></td>
        </tr>
      </tbody>
    </v-table> 
  </div>
</template>
