import { List } from 'linqts';
import { Dictionary } from '@/helper/arrayHelper';
import { GraphTableData } from '../xflow';

export class GraphHelper {
  static toSQl(graphObj: {
    cells: Array<{
      id: string;
      shape: `html` | `edge`;
      source: {
        cell: string;
        port: string;
      };
      data: GraphTableData;
      target: {
        cell: string;
        port: string;
      };
    }>;
  }) {
    console.log(graphObj);
    let sql = ``;
    const queryFieldStr = [];
    const tabMap: Dictionary<string, boolean> = {};
    for (let index = 0; index < graphObj.cells.length; index++) {
      const { shape, data, target, source } = graphObj.cells[index];
      if (shape === 'html' || !target) {
        for (let index = 0; index < data.Columns.length; index++) {
          const columnObj = data.Columns[index];
          if (columnObj.IsSelect) {
            queryFieldStr.push(
              `${data.Name}.${columnObj.FieldName} as ${data.Name}_${columnObj.FieldName}`,
            );
          }
        }
        continue;
      }

      if (!tabMap[source.cell] && !tabMap[target.cell]) {
        tabMap[source.cell] = true;
        tabMap[target.cell] = true;
        sql += `
      ${source.cell}
      left join ${target.cell}
           on ${source.cell}.${source.port} = ${target.cell}.${target.port}\r\n`;
        continue;
      }
      if (tabMap[source.cell] && tabMap[target.cell]) {
        sql += `
           and ${source.cell}.${source.port} = ${target.cell}.${target.port}\r\n`;
        continue;
      }
      if (tabMap[source.cell]) {
        tabMap[target.cell] = true;
        sql += `
      left join ${target.cell}
           on ${source.cell}.${source.port} = ${target.cell}.${target.port}\r\n`;
        continue;
      }
      if (tabMap[target.cell]) {
        tabMap[source.cell] = true;
        sql += `
      right join ${source.cell}
           on ${source.cell}.${source.port} = ${target.cell}.${target.port}\r\n`;
        continue;
      }
    }
    // select * from tableA left join tableB on tableA.Id=tableB.Id
    return `select ${queryFieldStr.join(`,`)}
      from ${sql}`;
  }
}
