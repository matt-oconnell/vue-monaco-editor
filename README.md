# vue-monaco-editor

> Monaco Editor Vue Component

> forked from https://github.com/matt-oconnell/vue-monaco-editor

> [![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

## New feature: DiffEditor

```
  options: {
    diffEditor: true,
  }
```

by passing `diffEditor` option to this vue component, a diff editor is created instead of regular monaco editor

## Setup

``` bash
npm install vue-monaco-editor --save
```

## Simple Vue Use

```js
import MonacoEditor from 'vue-monaco-editor'

// use in component
export default {
  components: {
    MonacoEditor
  }
}
```

## Component Props

| Option        | Type          | Default | Description
|:-------------|:-------------|:-------|:-------|
| language      | String        | `javascript` | |
| height        | Number/String | `100%` ||
| width | Number/String | `100%` ||
| code | String | `// code \n` | Initial code to show |
| theme | String | `vs-dark` | vs, hc-black, or vs-dark |
| highlighted | Array[Object] | `[{ number: 0, class: ''}]` | Lines to highlight with numbers and `.classes` |
| changeThrottle | Number(ms) | `0` |  throttle `codeChange` emit |
|srcPath| String | `""` | see *Webpack Use* below
| editorOptions | Object | Merged with defaults below | See [Monaco Editor Options](https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html) |

### Editor Default Options
```js
defaults: {
  selectOnLineNumbers: true,
  roundedSelection: false,
  readOnly: false,
  cursorStyle: 'line',
  automaticLayout: false,
  glyphMargin: true
}
```

## Component Events

*These events are available to parent component*

| Event        | Returns          | Description
|:-------------|:-------------|:-------|
|mounted|`editor`[editor instance]|Emitted when editor has mounted|
|codeChange|`editor`[editor instance]|Emitted when code has changed|

## Example

*Component Implementation*
```vue
<MonacoEditor
    height="600"
    language="typescript"
    :code="code"
    :editorOptions="options"
    @mounted="onMounted"
    @codeChange="onCodeChange"
    >
</MonacoEditor>
```

*Parent*
```js
module.exports = {
  components: {
    Monaco
  },
  data() {
    return {
      code: '// Type away! \n',
      options: {
        selectOnLineNumbers: false
      }
    };
  },
  methods: {
    onMounted(editor) {
      this.editor = editor;
    },
    onCodeChange(editor) {
      console.log(editor.getValue());
    }
  }
};
```

## Webpack Use

By default, monaco-editor is loaded from a cdn asyncronously using `require`. To use a local copy of `monaco-editor` with webpack, we need to expose the dependency in our build directory:

`npm install copy-webpack-plugin --save-dev`

Add this to your webpack.config.js:

```js
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
  plugins: [
    new CopyWebpackPlugin([
      {
        from: 'node_modules/monaco-editor/min/vs',
        to: 'vs',
      }
    ])
  ]
};
```

Then, specify the build directory path in the `srcPath` prop. See `src/App.vue` for an example.

## Integrate cross domain webworker

Add this to your webpack.config.js:

```js
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
  plugins: [
    new CopyWebpackPlugin([
      { from: './node_modules/vue-monaco-editor/src/monaco-editor-worker-loader-proxy.js' }
    ])
  ]
};
```

## Dev Use

```
git clone [this repo] .
npm install
npm run dev
```

Edit `src/App.vue`
