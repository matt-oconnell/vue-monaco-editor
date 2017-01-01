<template>
  <div>
    <!-- Load from webpack (note the srcPath="dist" prop) -->
    <Monaco
        height="600"
        language="typescript"
        srcPath="dist"
        :code="code"
        :options="options"
        :highlighted="highlightLines"
        :changeThrottle="500"
        theme="vs-dark"
        @mounted="onMounted"
        @codeChange="onCodeChange"
        >
    </Monaco>
    <!-- Load from default cdn -->
    <Monaco
        height="600"
        language="typescript"
        :code="code"
        :options="options"
        :highlighted="highlightLines"
        :changeThrottle="500"
        theme="vs-dark"
        @mounted="onMounted2"
        @codeChange="onCodeChange2"
        >
    </Monaco>
    <button @click="clickHandler">Log value</button>
    <input v-model="highlightLines[0].number" placeholder="primary highlight #">
    <input v-model="highlightLines[1].number" placeholder="secondary highlight #">
  </div>
</template>

<script>
const Monaco = require('./Monaco.vue')

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
    onMounted2(editor) {
      console.log('after mount!', editor, editor.getValue(), editor.getModel());
      this.editor2 = editor;
    },
    onCodeChange(editor) {
      console.log('code changed!', 'code:' + this.editor.getValue());
    },
    onCodeChange2(editor) {
      console.log('code changed!', 'code:' + this.editor2.getValue());
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
