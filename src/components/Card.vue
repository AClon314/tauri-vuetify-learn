<template>
  <v-card class="mx-auto" :width="(imgWH[0] * 300) / imgWH[1]">
    <v-img
      height="300px"
      :src="img.src"
      cover
      ></v-img
    >

    <v-card-title> {{ title }} </v-card-title>

    <v-card-subtitle> {{ subtitle }} </v-card-subtitle>

    <v-card-actions>
      <v-btn color="primary" variant="text"> 设置壁纸 </v-btn>

      <v-spacer></v-spacer>

      <v-btn
        :icon="show ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        @click="show = !show"
      ></v-btn>
    </v-card-actions>

    <v-expand-transition>
      <div v-show="show">
        <v-divider></v-divider>

        <v-card-text style="white-space: pre-line;">
          {{ detailInfo }}
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";

const imgWH = ref([0, 0]);
const show = ref(false);
const img = ref(new Image());
const props = defineProps({
  src: String,
  title: String,
  subtitle: String,
  detailInfo: String,
});
onMounted(() => {
  img.value.src = props.src ?? "error";
  img.value.onload = () => {
    imgWH.value = [img.value.width, img.value.height];
  };
});
</script>
