# TODO
- [ ] front service to keep music playing
- [ ] android local storage access (readfile)
- [ ] set photo as wallpaper

# What I've learned?
- vitest
- my debounce implement
- use ref for v-model, don't use appStore for v-model(especially with pinia-persist-plugin).
persist() take 42ms,which cause laggy progress bar.
- [key, value] = nameOf({myVar}); Objects.keys({myVar})[0]
- Object.assign for substitute inside ref, without new Object\<Ref\>

# 下一步探索
- 如何控制内存用量(500MB，pc `pnpm dev`下标签页内存160MB)，感觉挂后台，相当于一个网页挂后台，而不是仅剩下一个服务。可以考虑把ui冻结
- 在使用store插件时，如何控制安卓`用户数据`大小（播放几次歌后，用户数据飙升至`40MB`）
- 如何加快MP3本地文件缓冲，10MB会卡顿1~3s左右。使用tauri.localhost情况下
- 不使用vuetify字体内嵌，节约1~2MB
- 通知栏不能stopNotify，否则马上后台杀掉

# Command
## update package version

```batch
pnpm list
cargo tree
cargo install --list

pnpm update
cargo update
rustup update

pnpm update --interactive
pnpm update "@babel/*"
pnpm update "!webpack"
cargo update -p PACKAGE_NAME --precise VERSION
```