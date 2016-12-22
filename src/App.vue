<template>
  <div>
    <Monaco
        height="600"
        language="javascript"
        :value="code"
        :options="options"
        :editorDidMount="editorDidMount"
        >
    </Monaco>
  </div>
</template>

<script>
const Monaco= require('./Monaco.vue')

module.exports = {
  components: {
    Monaco
  },
  data() {
    return {
      code: '// type your code \n'
    };
  },
  methods: {
    editorDidMount(editor) {
      console.log('editorDidMount', editor, editor.getValue(), editor.getModel());
      this.editor = editor;
    }
  },
  created() {
    this.options = {
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      theme: 'vs',
      cursorStyle: 'line',
      automaticLayout: false,
    };
  }
};
</script>
