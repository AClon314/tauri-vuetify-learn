<template>
  <v-col>
    <v-text-field
      clearable
      label="路径"
      variant="underlined"
      v-model="dirPath"
      append-icon="mdi-send"
      @click:append="refresh()"
      @keydown.enter="refresh()"
    ></v-text-field>
    <v-btn
      @click="
        changeTextfield(
          '/storage/emulated/0/Android/data/com.tauri.tauri_app/files/Musics'
        )
      "
      >默认</v-btn
    >
    <v-btn @click="changeTextfield('/storage/emulated/0/Android')">安卓</v-btn>
    <v-btn @click="changeTextfield('/storage/emulated/0/Musics')">Musics</v-btn>
    <v-btn @click="pageReload()">刷新</v-btn>

    <a
      v-if="isTauri && isPC"
      @click="cmd('start http://localhost:1420/')"
      href="javascript:;"
      >浏览器</a
    >
  </v-col>

  <v-list lines="two">
    <v-list-item
      v-for="(item, i) in medias"
      :key="i"
      :value="item"
      :title="item.name"
      :subtitle="item.path"
      :prepend-avatar="item.cover"
      @click="appStore.setCurrentMedia(i)"
      color="primary"
    ></v-list-item>
  </v-list>
</template>

<script lang="ts" setup>
import { inject, ref } from "vue";
import {
  exists,
  readFile,
  readDir,
  BaseDirectory,
  stat,
  FileInfo,
} from "@tauri-apps/plugin-fs";
import { convertFileSrc } from "@tauri-apps/api/core";
import * as tauPath from "@tauri-apps/api/path";
import { MediaItem } from "../types";
import { useAppStore } from "../stores/app";
const appStore = useAppStore();

const isTauri = inject("isTauri");
const isPC = inject("isPC");
const medias = appStore.myMediaList;
const dirPath = ref();
const current = ref();
refresh();

async function refresh() {
  if (isTauri) {
    let paths;
    if (dirPath.value == undefined) {
      // init dirPath
      dirPath.value = await tauPath.pictureDir();
      paths = await ls(`${await bDir2str(BaseDirectory.Picture)}`);
    } else {
      paths = await ls(dirPath.value);
    }
    medias.values = paths.filter(
      (p) =>
        p.name.endsWith(".mp3") ||
        p.name.endsWith(".ogg") ||
        p.name.endsWith(".wmv")
    );
  } else {
    appStore.setMyMediaList([
      {
        name: "半斤八两",
        path: "许冠杰",
        url: "http://music.163.com/song/media/outer/url?id=172386.mp3",
        cover:
          "https://p1.music.126.net/Wg-nrULm75dl0K3EkyQFLQ==/109951166280515519.jpg?param=130y130",
      },
      {
        name: "Klamauk",
        path: "阿保剛",
        url: "http://music.163.com/song/media/outer/url?id=4993314.mp3",
        cover:
          "https://p2.music.126.net/AsPH-WlzIw7lkvwT-3lSHA==/5978044720410513.jpg?param=130y130",
      },
      {
        name: "非tauri环境",
        path: "仅供测试",
        url: "",
      },
    ]);
  }
}

function pageReload() {
  location.reload();
}

async function bDir2str(base: BaseDirectory): Promise<string> {
  return await eval(`tauPath.${BaseDirectory[base].toLocaleLowerCase()}Dir()`);
}

async function ls(dir: string, recursive = false) {
  const entries = await readDir(dir);
  const paths: {}[] = [];
  for (const entry of entries) {
    const absPath = await tauPath.join(dir, entry.name);
    // const fileInfo = await stat(absPath);
    if (paths.length > 20) {
      break;
    }
    paths.push({
      name: entry.name,
      url: convertFileSrc(absPath),
      path: absPath,
    });
  }
  return paths;
}

const changeTextfield = (e: any) => {
  dirPath.value = e;
};

import { Command } from "@tauri-apps/plugin-shell";
async function cmd(cmd: string) {
  const result = await Command.create("exec-sh", ["-c", cmd]).execute();
  console.log(result);
  return result;
}
</script>
