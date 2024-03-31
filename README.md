# Tauri_beta + Vuetify (Layouts+Pinia) + TS
This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## template init
```
pnpm install
pnpm tauri dev
```
for mobile dev, run above then:
```
pnpm tauri android init
pnpm tauri android dev
```

## how to make my own tauri-vite template
#### 1. New 2 project: `tauri-app` and `your-vite`
```
pnpm create tauri
pnpm create vuetify
```
>[!CAUTION]
> DON'T run `pnpm install` or `pnpm run dev`, it will make it more complicate.

#### 2. push blank tauri to a new repo
#### 3. copy `.git` folder from `tauri-app` into `your-vite`
#### 4. open `your-vite`, merge conflicts
- Untrack added files, just accepct
- Deleted files, just discard changes
- Modified files, you have to check them:
e.g. [package.json](https://github.com/AClon314/tauri-vuetify-template/blob/main/package.json#L3-L9), `main.ts`, `vite.config.ts`, `tsconfig.node.json`, some `.gitignore` files, etc. You can check [commits](https://github.com/AClon314/tauri-vuetify-template/commit/f42cf178d1cb683155a1f5186f0fdd807103d58c) as reference.
#### 5. test OK **then** push `your-vite`, check your repo😉
Source code only: before push, discard changes(also will delete) with the generated files.

## how to migrate tauri into exsisting project
copy your exisiting project `src` into `your-template`, merge conflicts.
_that's the most painful moment_

## common Errors
>[!CAUTION] 
> Error: listen EACCES: permission denied ::1:1420
> change `tauri.conf.json` and `vite.config.mts` dev server port from `1420` to `3000`(just a random port number)
