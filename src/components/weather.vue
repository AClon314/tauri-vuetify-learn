<script setup>
import { ref } from "vue";
import { getWeather } from "../service/weather";
import { en, cn } from "../service/i18n";
var date,
  darkMode = false;
let raw;
const bgColor = ref("");
const weather = ref({});
const location = ref("");

function formatDate() {
  if (!date) {
    date = new Date();
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始，所以需要+1
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  if (hours > 18 || hours < 6) {
    darkMode = true;
  }
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
function windDir(dir) {
  if (dir >= 0 && dir <= 22.5) {
    return "北";
  } else if (dir > 22.5 && dir <= 67.5) {
    return "东北";
  } else if (dir > 67.5 && dir <= 112.5) {
    return "东";
  } else if (dir > 112.5 && dir <= 157.5) {
    return "东南";
  } else if (dir > 157.5 && dir <= 202.5) {
    return "南";
  } else if (dir > 202.5 && dir <= 247.5) {
    return "西南";
  } else if (dir > 247.5 && dir <= 292.5) {
    return "西";
  } else if (dir > 292.5 && dir <= 337.5) {
    return "西北";
  } else {
    return "北";
  }
}
function windSpeed2Level(speed) {
  if (speed < 1) {
    return 0;
  } else if (speed >= 1 && speed < 6) {
    return 1;
  } else if (speed >= 6 && speed < 12) {
    return 2;
  } else if (speed >= 12 && speed < 20) {
    return 3;
  } else if (speed >= 20 && speed < 29) {
    return 4;
  } else if (speed >= 29 && speed < 39) {
    return 5;
  } else if (speed >= 39 && speed < 50) {
    return 6;
  } else if (speed >= 50 && speed < 62) {
    return 7;
  } else if (speed >= 62 && speed < 75) {
    return 8;
  } else if (speed >= 75 && speed < 89) {
    return 9;
  } else if (speed >= 89 && speed < 103) {
    return 10;
  } else if (speed >= 103 && speed < 118) {
    return 11;
  } else {
    return 12;
  }
}
function updateBackgroundColor() {
  let hour = new Date().getHours();
  // let weather = en(weather.value[0].icon); // 假设你的天气数据存储在`this.weather`中
  if (hour > 18 || hour < 6) {
    bgColor.value = `#112258,#90609E`;
  } else{
    bgColor.value = `#9af0ff,#70ffdf`;
  }
  document.documentElement.style.setProperty('--bg-color', `linear-gradient(${bgColor.value})`);
}
function changeCity() {
  location.value = "Guangzhou,Guangdong,China";
  init();
}

location.value = "Nanchang,Jiangxi,China";
async function init() {
  raw = await getWeather(location.value); //await是一个解构赋值，不能getWeather().days直接访问json成员
  weather.value = raw.days;
  updateBackgroundColor();
  console.log(weather.value);
}

const loadMore = async () => {
  console.log("loadMore");
  // 在这里获取更多的数据，并更新你的组件
};
init();
</script>

<template>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/weather-icons/2.0.12/css/weather-icons.min.css"
    integrity="sha512-r/Gan7PMSRovDus++vDS2Ayutc/cSdl268u047n4z+k7GYuR7Hiw71FsT3QQxdKJBVHYttOJ6IGLnlM9IoMToQ=="
    crossorigin="anonymous"
    referrerpolicy="no-referrer"
  />

  <h1 @click="changeCity">南昌</h1>
  <p style="text-align: center">
    更新 {{ weather.length > 0 ? formatDate() : "失败" }}
  </p>
  <div class="col" v-if="weather.length > 0" v-infinite-scroll="loadMore">
    <!-- line-height:1 解决上溢出字体 -->
    <div class="row" style="margin: 3em 0 3em 0; justify-content: center">
      <span style="font-weight: 200; font-size: 6em; line-height: 1"
        >{{ weather[0].temp }}°</span
      >
      <div
        class="col"
        style="text-align: right; justify-content: space-between"
      >
        <i
          style="font-size: 3em"
          :class="
            'wi wi-' + (darkMode ? 'night' : 'day') + '-' + en(weather[0].icon)
          "
        ></i>

        <p style="font-weight: 400; font-size: 2em; margin-bottom: 13px">
          {{ cn(en(weather[0].icon)) }}
        </p>
      </div>
    </div>

    <div v-for="(item, i) in weather" style="margin: 1em">
      <div class="row" style="margin: 1em 0 1em 0">
        <p>{{ item.datetime }}</p>
        <p>{{ item.tempmax }}°/{{ item.tempmin }}°</p>
        {{ windDir(item.winddir) }}风{{ windSpeed2Level(item.windspeed) }}级
      </div>

      <div class="row">
        <div class="col">
          <i :class="'wi wi-' + en(item.hours[9].icon)"></i>
          <p>{{ cn(en(item.hours[9].icon)) }}</p>
          {{ "白天" }}
        </div>

        <div class="col">
          <i :class="'wi wi-' + en(item.hours[20].icon)"></i>
          <p>{{ cn(en(item.hours[20].icon)) }}</p>
          {{ "晚上" }}
        </div>

        <div class="col">
          <i
            :class="
              'wi ' +
              (item.precip > 0
                ? 'wi-raindrop' + (item.precip > 10 ? '' : 's')
                : 'wi-na')
            "
          ></i>
          <p>{{ item.precip }}mm</p>
          {{ "降水量" }}
        </div>

        <div class="col">
          <i class="wi wi-humidity"></i>
          <p>{{ item.humidity }}%</p>
          {{ "相对湿度" }}
        </div>
      </div>
    </div>
  </div>
</template>
