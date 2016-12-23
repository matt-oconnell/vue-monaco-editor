<template>
  <div>
    <Monaco
        height="600"
        language="javascript"
        :code="code"
        :editorOptions="options"
        :highlighted="highlightLines"
        :codeChangeCallbackThrottle="0"
        @mounted="onMounted"
        @codeChange="onCodeChange"
        >
    </Monaco>
    <button @click="clickHandler">Log value</button>
    <input v-model="highlightLines[0].number" placeholder="primary highlight #">
    <input v-model="highlightLines[1].number" placeholder="secondary highlight #">
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
      code: '// type your code \n',
      highlightLines: [
        {
          number: 0,
          class: 'primary-highlighted-line'
        },
        {
          number: 0,
          class: 'secondary-highlighted-line'
        }
      ]
    };
  },
  methods: {
    onMounted(editor) {
      console.log('after mount!', editor, editor.getValue(), editor.getModel());
      this.editor = editor;
    },
    onCodeChange(editor) {
      console.log('code changed!', 'code:' + this.editor.getValue());
    },
    clickHandler() {
      console.log('here is the code:', this.editor.getValue());
    }
  },
  created() {
    this.options = {
      selectOnLineNumbers: false
    };
  }
};
</script>

<style media="screen">
  .secondary-highlighted-line {
    background: green;
  }
  .primary-highlighted-line {
    background: blue;
  }
</style>
