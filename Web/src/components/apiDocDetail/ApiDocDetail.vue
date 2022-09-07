<template>
  <div class="markdown-body pb-200px w-max-800px" v-html="source"></div>
</template>
<script lang="ts" setup>
import markdownit from 'markdown-it';
import hljs from 'highlight.js';
import { getApiMarkDown } from './apiDocDetailViewModel';
import { TableApiViewModel } from '../tableApiDoc/tabApiViewModel';

const props = defineProps({
  apiId: {
    type: String,
    required: true,
  },
  viewModel: {
    type: TableApiViewModel,
    required: true,
  },
});
const source = ref(``);
const md = markdownit({ html: true });
md.set({
  highlight(str: any, lang: any) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(lang, str, true).value}</code></pre>`;
      } catch (err) {
        console.log(err);
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});
const initMarkDown = () => {
  const mkd = getApiMarkDown(props.viewModel);
  console.log(mkd);
  source.value = md.render(mkd);
};
initMarkDown();
watch([props.viewModel.activeKey], () => {
  initMarkDown();
});
</script>
<style lang="less">
.markdown-body {
  height: calc(100vh - 226px);
  width: 100%;
  overflow: auto;
}
.paramBlock {
  @borderColor: #e1e6f0;
  position: relative;
  background-color: @primary-color;
  height: calc(100vh - 226px);
  overflow: auto;
  padding: 10px;
  border-radius: 5px;
  h2 {
    border-left: solid 3px @borderColor;
    padding-left: 10px;
  }
  .paramTable {
    border: solid 1px @borderColor;
    width: 500px;
  }
  td {
    border-left: solid 1px @borderColor;
    border-top: solid 1px @borderColor;
    padding: 5px;
    text-align: left;
  }
  .twoLevel {
    padding-left: 40px;
  }
  .code {
    background-color: #50556b;
    color: white;
    border-radius: 5px;
    padding: 5px;
    margin-bottom: 10px;
    .code-1 {
      padding-left: 10px;
    }
    .code-2 {
      padding-left: 20px;
    }
  }
}
</style>
