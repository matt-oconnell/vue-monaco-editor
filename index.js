var editor = require('./src/App.vue')
var monacoEditorBuild = function(Vue) {
 Vue.component('monaco-editor', player)
}

var monacoEditor = {
 monacoEditor: editor,
 install: function(Vue) {
   monacoEditorBuild(Vue)
 }
}

module.exports = monacoEditor
