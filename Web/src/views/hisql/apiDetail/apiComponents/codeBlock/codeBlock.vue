<template>
  <div ref="monacoContianer" class="monacoWaper"></div>
</template>
<script lang="ts" setup>
import * as monaco from 'monaco-editor';
import { CodeBlockViewModel } from './codeBlockViewModel';

// monaco.languages.typescript.typescriptDefaults.addExtraLib(`export class UserKK
// {
//       private name;
//       private age;
//       constructor(name: string, age: number)
//       {
//       }
//       show(): void{
//      }
// }`);

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  // target: monaco.languages.typescript.ScriptTarget.ESNext,
  // allowNonTsExtensions: true,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  // module: monaco.languages.typescript.ModuleKind.ESNext,
  // noEmit: true,
  // noLib: true,
  // typeRoots: ['node_modules/@types'],
});

const viewModel = new CodeBlockViewModel();

const monacoContianer = ref<HTMLElement | null>(null);
let monacoObj: monaco.editor.IStandaloneCodeEditor;

// monaco.languages.typescript.typescriptDefaults.setExtraLibs([
//   {
//     content: `export function add(a: number, b: number): number{
//       return a+b;
//     }`,
//     filePath: `file:///math/index.d.ts`,
//   },
// ]);
const emit = defineEmits([`update:value`]);

const model = monaco.editor.createModel(
  viewModel.Code,
  'typescript',
  monaco.Uri.parse('file:///main.tsx'),
);

onMounted(() => {
  if (!monacoContianer.value) {
    return;
  }
  monacoObj = monaco.editor.create(monacoContianer.value, {
    model,
  });
  // monacoObj.getValue();
});
const saveCode = () => {
  const codeString = monacoObj.getValue();
  emit('update:value', codeString);
};

/**
 * 对外暴露的对象
 */
defineExpose({
  saveCode,
});
</script>

<style>
.monacoWaper {
  height: 300px;
}
</style>
