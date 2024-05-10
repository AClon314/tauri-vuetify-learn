<script setup>

</script>

<template>
  <div class="row">
    <h2>Weather</h2>
    <p>Click the button to get the weather</p>
    <button @click="getWeather">Get Weather</button>
    <p>{{ weather }}</p>
  </div>
</template>