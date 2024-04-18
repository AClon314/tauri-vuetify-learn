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
    <v-btn @click="changeTextfield(defaultPath)">默认</v-btn>
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

  <v-list
    lines="two"
    v-model:selected="appStore.selected"
    select-strategy="single-independent"
  >
    <v-list-item
      v-for="(item, i) in appStore.myMediaList"
      :key="item.path"
      :value="i"
      :title="item.name"
      :subtitle="item.alias"
      :prepend-avatar="item.cover"
      @click="appStore.setCurrentMedia(i)"
      color="primary"
    >
    </v-list-item>
  </v-list>
</template>

<script lang="ts" setup>
import { convertFileSrc } from "@tauri-apps/api/core";
import * as tauPath from "@tauri-apps/api/path";
import * as tauFs from "@tauri-apps/plugin-fs";

import { inject, ref } from "vue";
import { useAppStore } from "../stores/app";
import * as mm from "music-metadata";
import { Buffer } from "buffer";
globalThis.Buffer = Buffer;
const appStore = useAppStore();

const isTauri = inject("isTauri");
const isPC = inject("isPC");
const dirPath = ref();
var defaultPath: string | undefined = undefined;
refresh();

async function refresh() {
  if (isTauri) {
    let paths: MediaItem[] = [];
    if (dirPath.value == undefined) {
      // init dirPath
      defaultPath = await tauPath.audioDir();
      paths = await ls(`${await bDir2str(tauFs.BaseDirectory.Audio)}`);
    } else {
      paths = await ls(dirPath.value);
    }
    paths = paths.filter(
      (p) => p.name.endsWith(".mp3") || p.name.endsWith(".ogg")
    );
    Promise.all(
      paths.map(async (p) => {
        const response = await fetch(p.url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        } else {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const metadata = await mm.parseBuffer(buffer, "audio/mpeg", {
            duration: true,
          });
          const cover = mm.selectCover(metadata.common.picture);
          if (cover) {
            p.cover = `data:${cover.format};base64,${cover.data.toString(
              "base64"
            )}`;
          }
          if (metadata.common.artist) {
            p.name = metadata.common.title || p.name;
            p.alias = metadata.common.artist;
            if (metadata.common.album) {
              p.alias += ` - ${metadata.common.album}`;
            }
          }
        }
        return p;
      })
    )
      .then((updatedPaths) => {
        appStore.setMyMediaList(updatedPaths);
      })
      .catch((e) => {
        console.error(e);
      });
  } else {
    appStore.setMyMediaList([
      {
        name: "半斤八两",
        alias: "许冠杰",
        url: "http://music.163.com/song/media/outer/url?id=172386.mp3",
        cover:
          "https://p1.music.126.net/Wg-nrULm75dl0K3EkyQFLQ==/109951166280515519.jpg?param=130y130",
      },
      {
        name: "Klamauk",
        alias: "阿保剛",
        url: "http://music.163.com/song/media/outer/url?id=4993314.mp3",
        cover:
          "https://p2.music.126.net/AsPH-WlzIw7lkvwT-3lSHA==/5978044720410513.jpg?param=130y130",
      },
      {
        name: "非tauri环境",
        alias: "仅供测试",
        url: "",
      },
    ]);
  }
}

function pageReload() {
  location.reload();
}

async function bDir2str(base: tauFs.BaseDirectory): Promise<string> {
  return await eval(
    `tauPath.${tauFs.BaseDirectory[base].toLocaleLowerCase()}Dir()`
  );
}

async function ls(dir: string, recursive = false): Promise<MediaItem[]> {
  const entries = await tauFs.readDir(dir);
  const paths: MediaItem[] = [];
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
import { MediaItem } from "@/types";
async function cmd(cmd: string) {
  const result = await Command.create("exec-sh", ["-c", cmd]).execute();
  console.log(result);
  return result;
}
</script>
