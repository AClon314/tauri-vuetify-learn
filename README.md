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