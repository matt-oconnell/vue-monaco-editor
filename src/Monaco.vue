<template>
  <div :style="style"></div>
</template>

<script>
module.exports = {
  template: '#container', // todo vue loader
  props: {
    width: { type: [String, Number], default: '100%' },
    height: { type: [String, Number], default: '100%' },
    code: { type: String, default: null },
    defaultValue: { type: String, default: '// type your code \n' },
    language: { type: String, default: 'javascript' },
    theme: { type: String, default: 'vs' },
    editorOptions: { type: Object, default: {} },
    highlighted: { type: Array, default: () => [{
      number: 0,
      class: ''
    }] },
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
  data() {
    return {
      options: {
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: false,
        theme: 'vs',
        cursorStyle: 'line',
        automaticLayout: false,
      }
    }
  },
  watch: {
    highlighted: {
      handler(lines) {
        if (!this.editor) {
          return;
        }
        lines.forEach((line) => {
          const className = line.class;
          number = parseInt(line.number);
          console.log(typeof number, number);
          const highlighted = this.$el.querySelector(`.${className}`);

          if (highlighted) {
            highlighted.classList.remove(className);
          }

          if (!this.editor && number < 1 || isNaN(number)) {
            return;
          }

          const selectedLine = this.$el.querySelector(`[linenumber="${number}"]`);
          if (selectedLine) {
            selectedLine.classList.add(className);
          }
        });
      },
      deep: true
    }
  },
  methods: {
    editorDidMount(editor, monaco) {
      console.log('internal: editorDidMount');
      this.editor = editor;
      this.monaco = monaco;
      this.editor.onDidChangeModelContent(event => {
        this.$emit('codeChange', editor);
      });
      this.$emit('mounted', editor);
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
      const code = this.code !== null ? this.code : this.defaultValue;
      const { language, theme } = this;
      const options = Object.assign({}, this.options, this.editorOptions);
      const containerElement = this.$el;
      const context = this.context || window;
      if (typeof context.monaco !== 'undefined') {
        // Before initializing monaco editor
        const editorOptions = Object.assign(options, { value: code, language, theme }, { glyphMargin: true });
        this.editor = context.monaco.editor.create(containerElement, editorOptions);
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
