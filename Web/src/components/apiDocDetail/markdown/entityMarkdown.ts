import { TableApiViewModel } from '@/components/tableApiDoc/tabApiViewModel';
import { codeWapre, getTableCSharpClass, getTableTsClass } from './apiMarkDownHelper';

export const entityMarkdownGenerate = (viewModel: TableApiViewModel) => {
  const classCode = getTableTsClass(viewModel.tableName, viewModel.tabColumnStruct);
  const cSharpClassCode = getTableCSharpClass(viewModel.tableName, viewModel.tabColumnStruct);
  return `
  > TypeScript
   ${codeWapre(classCode, `TS`)}

   <br/>

   > C#
   ${codeWapre(cSharpClassCode, `C#`)}
  `;
};
