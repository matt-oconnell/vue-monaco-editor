<template>
  <div :style="style"></div>
</template>

<script>
var debounce = require('lodash.debounce');
var monacoLoader = require('./MonacoLoader');

module.exports = {
  props: {
    width: { type: [String, Number], default: '100%' },
    height: { type: [String, Number], default: '100%' },
    code: { type: String, default: '// code \n' },
    srcPath: { type: String },
    language: { type: String, default: 'javascript' },
    theme: { type: String, default: 'vs-dark' }, // vs, hc-black
    options: { type: Object, default: () => {} },
    highlighted: { type: Array, default: () => [{
      number: 0,
      class: ''
    }] },
    changeThrottle: { type: Number, default: 0 },
    diffEdittor: { type: Boolean, default: false}
  },
  mounted() {
    this.fetchEditor();
  },
  destroyed() {
    this.destroyMonaco();
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
    },
    editorOptions() {
      return Object.assign({}, this.defaults, this.options, {
        value: this.code,
        language: this.language,
        theme: this.theme
      });
    }
  },
  data() {
    return {
      defaults: {
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: false,
        cursorStyle: 'line',
        automaticLayout: false,
        glyphMargin: true,
        diffEdittor: false
      }
    }
  },
  watch: {
    highlighted: {
      handler(lines) {
        this.highlightLines(lines);
      },
      deep: true
    },
    language () {
      window.monaco.editor.setModelLanguage(this.editor.getModel(), this.language)
    }
  },
  methods: {
    highlightLines(lines) {
      if (!this.editor) {
        return;
      }
      lines.forEach((line) => {
        const className = line.class;
        const highlighted = this.$el.querySelector(`.${className}`);

        if (highlighted) {
          highlighted.classList.remove(className);
        }

        const number = parseInt(line.number);
        if (!this.editor && number < 1 || isNaN(number)) {
          return;
        }

        const selectedLine = this.$el.querySelector(`.view-lines [linenumber="${number}"]`);
        if (selectedLine) {
          selectedLine.classList.add(className);
        }
      });
    },
    editorHasLoaded(editor, monaco) {
      this.editor = editor;
      this.monaco = monaco;
      this.editor.onDidChangeModelContent(event =>
        this.codeChangeHandler(editor, event)
      );
      this.$emit('mounted', editor);
    },
    codeChangeHandler: function(editor) {
      if (this.codeChangeEmitter) {
        this.codeChangeEmitter(editor);
      } else {
        if(!this.editorOptions.diffEditor) {
          this.codeChangeEmitter = debounce(
            function(editor) {
              this.$emit('codeChange', editor);
            },
            this.changeThrottle
          );

        }
        this.codeChangeEmitter(editor);
      }
    },
    fetchEditor() {
      monacoLoader.load(this.srcPath, this.createMonaco);
    },
    setDiffModels: function (editor, original, modified) {
      var originalModel = window.monaco.editor.createModel(original, "solidity");
      var modifiedModel = window.monaco.editor.createModel(modified, "solidity");

      editor.setModel({
        original: originalModel,
        modified: modifiedModel
      });

      editor.setModel({
        original: originalModel,
        modified: modifiedModel
      });
    },
    createMonaco() {
      var isDiffEditor = this.editorOptions.diffEditor;

      if (isDiffEditor) {
        var diffEdtiorOptions = Object.assign({}, this.editorOptions, {
          // You can optionally disable the resizing
          enableSplitViewResizing: false,

          // Render the diff inline
          renderSideBySide: false,
          renderIndicators: false,
          quickSuggestions: false,
          diffOverviewRuler: {
            enabled: false
          },
          renderLineHighlight: "line"
        });
        this.editor = window.monaco.editor.createDiffEditor(this.$el, diffEdtiorOptions);
      } else {
        this.editor = window.monaco.editor.create(this.$el, this.editorOptions);
      }
      this.editorHasLoaded(this.editor, window.monaco);
    },
    destroyMonaco() {
      if (typeof this.editor !== 'undefined') {
        this.editor.dispose();
      }
    }
  }
};
</script>
