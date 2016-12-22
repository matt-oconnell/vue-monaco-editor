<template>
  <div :style="style">
    <button v-on:click="clickHandler">Log value</button>
    <input v-model="highlight" placeholder="highlight line #">
  </div>
</template>

<script>
function noop() {}

module.exports = {
  template: '#container', // todo vue loader
  props: {
    width: { type: [String, Number], default: '100%' },
    height: { type: [String, Number], default: '100%' },
    value: { type: String, default: null },
    defaultValue: { type: String, default: '' },
    language: { type: String, default: 'javascript' },
    theme: { type: String, default: 'vs' },
    options: { type: Object, default: {} },
    editorDidMount: { type: Function, default: noop },
    editorWillMount: { type: Function, default: noop },
    onChange: { type: Function, default: noop },
    requireConfig: {
      type: Object,
      default: () => {
        return {
          url: 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.1/require.min.js',
          paths: {
            vs: 'https://as.alipayobjects.com/g/cicada/monaco-editor-mirror/0.6.1/min/vs'
          }
        };
      }
    }
  },
  data() {
    return {
      highlight: 0
    }
  },
  destroyed() {
    this.destroyMonaco();
  },
  mounted() {
    this.afterViewInit();
  },
  computed: {
    style() {
      const { width, height } = this;
      const fixedWidth = width.toString().indexOf('%') !== -1 ? width : `${width}px`;
      const fixedHeight = height.toString().indexOf('%') !== -1 ? height : `${height}px`;
      return {
        width: fixedWidth,
        height: fixedHeight,
      };
    }
  },
  watch: {
    highlight(val) {
      val = parseInt(val);
      const highlighted = this.$el.querySelector('.highlighted-line');

      if (highlighted) {
        highlighted.classList.remove('highlighted-line');
      }

      if (!this.editor && val < 1 || isNaN(val)) {
        return;
      }

      const line = this.$el.querySelector(`[linenumber="${val}"]`);
      if (line) {
        line.classList.add('highlighted-line');
      }
    }
  },
  methods: {
    clickHandler() {
      console.log('here is the code:', this.editor.getValue());
    },
    editorDidMount(editor, monaco) {
      console.log('editorDidMount', editor, editor.getValue(), editor.getModel());
      this.editor = editor;
      this.monaco = monaco;
      this.editor.onDidChangeModelContent(event => {
        const value = editor.getValue();
        console.log(value);
        // todo: allow hook for model change
      });
    },
    afterViewInit() {
      const { requireConfig } = this;
      const loaderUrl = requireConfig.url || 'vs/loader.js';
      const context = this.context || window;
      const onGotAmdLoader = () => {
        if (context.__VUE_MONACO_EDITOR_LOADER_ISPENDING__) {
          // Do not use webpack
          if (requireConfig.paths && requireConfig.paths.vs) {
            context.require.config(requireConfig);
          }
        }

        // Load monaco
        context.require(['vs/editor/editor.main'], () => {
          this.initMonaco();
        });

        // Call the delayed callbacks when AMD loader has been loaded
        if (context.__VUE_MONACO_EDITOR_LOADER_ISPENDING__) {
          context.__VUE_MONACO_EDITOR_LOADER_ISPENDING__ = false;
          const loaderCallbacks = context.__VUE_MONACO_EDITOR_LOADER_CALLBACKS__;
          if (loaderCallbacks && loaderCallbacks.length) {
            let currentCallback = loaderCallbacks.shift();
            while (currentCallback) {
              currentCallback.fn.call(currentCallback.context);
              currentCallback = loaderCallbacks.shift();
            }
          }
        }
      };

      // Load AMD loader if necessary
      if (context.__VUE_MONACO_EDITOR_LOADER_ISPENDING__) {
        // We need to avoid loading multiple loader.js when there are multiple editors loading concurrently
        //  delay to call callbacks except the first one
        context.__VUE_MONACO_EDITOR_LOADER_CALLBACKS__ = context.__VUE_MONACO_EDITOR_LOADER_CALLBACKS__ || [];
        context.__VUE_MONACO_EDITOR_LOADER_CALLBACKS__.push({
          context: this,
          fn: onGotAmdLoader
        });
      } else {
        if (typeof context.require === 'undefined') {
          const loaderScript = context.document.createElement('script');
          loaderScript.type = 'text/javascript';
          loaderScript.src = loaderUrl;
          loaderScript.addEventListener('load', onGotAmdLoader);
          context.document.body.appendChild(loaderScript);
          context.__VUE_MONACO_EDITOR_LOADER_ISPENDING__ = true;
        } else {
          onGotAmdLoader();
        }
      }
    },
    initMonaco() {
      const value = this.value !== null ? this.value : this.defaultValue;
      const { language, theme, options } = this;
      const containerElement = this.$el;
      const context = this.context || window;
      if (typeof context.monaco !== 'undefined') {
        // Before initializing monaco editor
        // this.editorWillMount(context.monaco);
        const data = Object.assign({ value, language, theme }, { options }, { glyphMargin: true });
        this.editor = context.monaco.editor.create(containerElement, data);
        // After initializing monaco editor
        this.editorDidMount(this.editor, context.monaco);
      }
    },
    destroyMonaco() {
      if (typeof this.editor !== 'undefined') {
        this.editor.dispose();
      }
    }
  }
};
</script>

<style media="screen">
  .highlighted-line {
    background: blue;
  }
</style>
