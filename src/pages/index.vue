<template>
  <div style="word-wrap: break-word">
    <v-col>
      <v-text-field
        clearable
        label="路径"
        variant="underlined"
        v-model="pictureDirPath"
        append-icon="mdi-send"
        @click:append="refresh()"
        @keydown.enter="refresh()"
      ></v-text-field>
      <v-btn
        @click="
          changeTextfield(
            '/storage/emulated/0/Android/data/com.tauri.tauri_app/files/Pictures'
          )
        "
        >默认</v-btn
      >
      <v-btn @click="changeTextfield('/storage/emulated/0/Android')"
        >安卓</v-btn
      >
      <v-btn @click="changeTextfield('/storage/emulated/0/DCIM/Screenshots')"
        >DCIM</v-btn
      >
      <v-btn @click="pageReload()">刷新</v-btn>

      <p>{{ ipv4 }}{{ isTauri }}</p>

      <a
        v-if="isTauri && isPC"
        @click="cmd('start http://localhost:1420/')"
        href="javascript:;"
        >浏览器</a
      >
      <a href="/musicPlayer">音乐播放</a>
    </v-col>
  </div>
  <div style="display: flex; flex-wrap: wrap">
    <Card
      v-for="(img, n) in imgs"
      :key="img.url"
      :src="img.url"
      :title="strEllipsis(img.name, 38)"
      :subtitle="stat2sub(img.stat)"
      :detail-info="file2detail(img)"
      style="margin-bottom: 1em"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { internalIpV4 } from "internal-ip";

const ipv4 = ref("");
internalIpV4().then((ip) => (ipv4.value = ip ?? ""));

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
import { askDir } from "@/plugins/askBaseDir";

const isTauri = inject("isTauri");
const isPC = inject("isPC");
const imgs = ref();
const pictureDirPath = ref();
refresh();

async function refresh() {
  if (isTauri) {
    let paths;
    if (pictureDirPath.value == undefined) {
      // init pictureDirPath
      pictureDirPath.value = await tauPath.pictureDir();
      paths = await ls(`${await askDir(BaseDirectory.Picture)}`);
    } else {
      paths = await ls(pictureDirPath.value);
    }
    imgs.value = paths.filter(
      (p) =>
        p.name.endsWith(".jpg") ||
        p.name.endsWith(".png") ||
        p.name.endsWith(".jpeg")
    );
  } else {
    imgs.value = [
      {
        url: "https://cdn.vuetifyjs.com/images/cards/sunshine.jpg",
        name: "宇宙",
      },
      { url: "https://i.imgur.com/o4Hqucc.gif", name: "当前非tauri环境" },
    ];
  }
}

function pageReload() {
  location.reload();
}

async function ls(dir: string, recursive = false) {
  const entries = await readDir(dir);
  const paths = [];
  for (const entry of entries) {
    const absPath = await tauPath.join(dir, entry.name);
    const fileInfo = await stat(absPath);
    if (paths.length > 20) {
      break;
    }
    paths.push({
      name: entry.name,
      url: convertFileSrc(absPath),
      path: absPath,
      stat: fileInfo,
    });
  }
  return paths;
}

const changeTextfield = (e: any) => {
  pictureDirPath.value = e;
};

import { Command } from "@tauri-apps/plugin-shell";
async function cmd(cmd: string) {
  const result = await Command.create("exec-sh", ["-c", cmd]).execute();
  console.log(result);
  return result;
}

import prettyBytes from "pretty-bytes";
import { format } from "date-fns";
function stat2sub(stat: FileInfo | undefined) {
  if (!stat) return "";
  return `${prettyBytes(stat.size ?? 0)}`;
}
function file2detail(file: any) {
  try {
    return `创建时间: ${format(
      file.stat.birthtime ?? "",
      "yyyy-MM-dd HH:mm:ss"
    )}\n修改时间: ${format(
      file.stat.mtime ?? "",
      "yyyy-MM-dd HH:mm:ss"
    )}\n路径: ${file.path}`;
  } catch {
    return "file2detail Err";
  }
}
function strEllipsis(str: string, len: number) {
  try {
    return (
      str.substring(0, Math.min(str.lastIndexOf("."), len)) +
        (str.length > len ? "..." : "") || str
    );
  } catch {
    return "strEllipsis Err";
  }
}
</script>
