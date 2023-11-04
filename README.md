# vite-plugin-lib-css-injection
An enhancement vite plugin of [vite-plugin-libcss](https://github.com/wxsms/vite-plugin-libcss/tree/master) that would inject the css file into your bundled js file.

# Note
Only support for **ESM** and [library-mode](https://vitejs.dev/guide/build.html#library-mode)

# Install
```shell
pnpm install vite-plugin-lib-css-injection --save -D
```

# Usage
## ESM
```javascript
import libCss from 'vite-plugin-lib-css-injection'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [libCss()],
  build: {
    lib: {
      entry: path.resolve(__dirname, './src/main.ts'),
    },
    rollupOptions: {
      output: [
        {
          dir: 'dist/esm',
          format: 'es',
          entryFileNames: 'index.js',
        }
      ],
    },
  },
})
```
build result like:
```javascript
// dist/esm/index.js
import "./style.css"
// rest of your bundled js file code
```

and if there is no `rollupOptions` but `lib.fileName`, this plugin will also work!
```javascript
lib: {
  fileName() {
    return 'esm/index.js'
  }
}
```
build result like:
```javascript
// dist/esm/index.js
import "../style.css"
// rest of your bundled js file code
```
That means this plugin will according to the entry filename to change the relative path of css file.

## CJS
```javascript
// vite.config.js
const libCss = require('vite-plugin-lib-css-injection')

module.exports = {
  plugins: [libCss()]
}
```
