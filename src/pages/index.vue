<template>
  <h3>{{ ipv4 }}{{ isTauri }}</h3>
  <div style="display: flex; flex-wrap: wrap">
    <Card
      v-for="(img, n) in imgs"
      :src="img.path"
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
import { pictureDir, join } from "@tauri-apps/api/path";

const isTauri = inject("isTauri");
const imgs = ref();
const pictureDirPath = await pictureDir();

if (isTauri) {
  ls(BaseDirectory.Picture, "").then((paths) => {
    imgs.value = paths.filter(
      (p) =>
        p.name.endsWith(".jpg") ||
        p.name.endsWith(".png") ||
        p.name.endsWith(".jpeg")
    );
  });
} else {
  imgs.value = [
    {
      path: "https://cdn.vuetifyjs.com/images/cards/sunshine.jpg",
      name: "宇宙",
    },
    { path: "https://i.imgur.com/o4Hqucc.gif", name: "当前非tauri环境" },
  ];
}
async function ls(base: BaseDirectory, dir: string, recursive = false) {
  const entries = await readDir(dir, { baseDir: base });
  const paths = [];
  for (const entry of entries) {
    const reletivePath = (dir ? dir + "/" : "") + entry.name;
    const fileInfo = await stat(reletivePath, { baseDir: base });
    const absPath = await join(pictureDirPath, reletivePath);
    if (paths.length > 20) {
      break;
    }
    paths.push({
      name: entry.name,
      path: convertFileSrc(absPath),
      stat: fileInfo,
    });
  }
  // if (recursive) {
  //   for (const entry of entries) {
  //     if (entry.isDirectory) {
  //       paths.push(...await ls(base, (dir?dir+'/':'')+entry.name, true));
  //     }
  //   }
  // }
  console.log(paths);
  return paths;
}

import prettyBytes from "pretty-bytes";
import { format } from "date-fns";
function stat2sub(stat: FileInfo | undefined) {
  if (!stat) return "";
  return `${prettyBytes(stat.size ?? 0)}`;
}
function file2detail(file: any | undefined) {
  if (!file) return "";
  return `创建时间：${format(
    file.stat.birthtime ?? "",
    "yyyy-MM-dd HH:mm:ss"
  )}\n修改时间：${format(
    file.stat.mtime ?? "",
    "yyyy-MM-dd HH:mm:ss"
  )}\n路径：${file.path}`;
}
function strEllipsis(str: string | undefined, len: number) {
  if (!str) return "";
  return (
    str.substring(0, Math.min(str.lastIndexOf("."), len)) +
      (str.length > len ? "..." : "") || str
  );
}
</script>
