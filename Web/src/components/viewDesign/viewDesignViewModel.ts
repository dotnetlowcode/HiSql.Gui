import { ApiTestExcute } from '@/serverApi/databaseAPIs';
import { createTableView, getTableInfo, saveFieldMap } from '@/serverApi/tableInfoAPIs';

import { codeWapre } from '../apiDocDetail/markdown/apiMarkDownHelper';
import { GraphHelper } from './x6/Helper/GraphHelper';
import { GraphData, GraphTableData, NodeConfig } from './x6/xflow';
import { StringHelper } from '@/helper/stringHelper';
import { typeFieldMapVue } from '../tableFieldMap/tableFieldMapViewModel';
import { Dictionary, SyncEach } from '@/helper/arrayHelper';
import { fieldSortFun } from '@/serverApi/models/columnStruct';

export class ViewDesignViewModel {
  RenderData: GraphData = {
    nodes: [],
    edges: [],
  };

  TableMap: Dictionary<string, NodeConfig> = {};

  IsLoad = false;

  InitRenderData = () => {
    // /**
    //  * 节点集合
    //  */
    // const nodes: NodeConfig[] = mockEntityData.map((entity: EntityCanvasModel) => {
    //   const { entityId, x, y, width, height } = entity;
    //   const nodeData: NodeConfig = {
    //     x,
    //     y,
    //     width,
    //     height,
    //     id: entityId,
    //     // render: (data: EntityCanvasModel) => {
    //     //   return <Entity entity={data} />;
    //     // },
    //     data: entity,
    //   };
    //   return nodeData;
    // });
    // this.RenderData.nodes.length = 0;
    // this.RenderData.nodes.push(...nodes);
    // /**
    //  * 关系集合
    //  */
    // const edges: EdgeConfig[] = mockRelationData.map((relation: RelationCanvasModel) => {
    //   const { relationId, sourceEntityId, targetEntityId } = relation;
    //   const edgeData: EdgeConfig = {
    //     id: relationId,
    //     source: sourceEntityId,
    //     target: targetEntityId,
    //     label: '1:N',
    //     // render: (data: RelationCanvasModel) => {
    //     //   return null;
    //     // },
    //     data: relation,
    //   };
    //   return edgeData;
    // });
    // this.RenderData.edges.length = 0;
    // this.RenderData.edges.push(...edges);
  };

  Sql = ``;

  async AddTables(tableNames: string) {
    const tableNameArray = tableNames.split(`,`);

    await SyncEach(tableNameArray, async (tableName: string) => {
      await this.AddTable(tableName);
      return true;
    });
  }

  async AddTable(tableName: string) {
    const { Data } = await getTableInfo(tableName);
    if (!Data) {
      return;
    }
    const topOffset = 39;
    const lineHeight = 28;
    const columnObjs = Data?.TabColumns ?? [];
    columnObjs.sort(fieldSortFun);
    const columnLen = columnObjs.length;
    const lineEnd = lineHeight * columnLen + topOffset;
    const itemPoints = [];
    const tableData = reactive(new GraphTableData());
    tableData.Name = Data.TabProps.TabName;
    tableData.Description = Data.TabProps.TabDescript;
    for (let index = 0; index < columnLen; index++) {
      const obj = columnObjs[index];
      tableData.Columns.push({
        FieldName: obj.FieldName,
        FieldDesc: obj.FieldDesc,
        IsSelect: false,
        IsPrimary: obj.IsPrimary,
        FieldType: `${obj.FieldType}`,
      });
      itemPoints.push({
        id: `${obj.FieldName}`,
        group: 'group1',
      });
    }

    const nodeData: NodeConfig<GraphTableData> = {
      x: 900,
      y: 280,
      width: 314,
      height: 248,
      id: tableName,
      data: tableData,
      // portMarkup: [Markup.getForeignObjectMarkup()], // 使用全局渲染
      ports: {
        groups: {
          group1: {
            attrs: {
              circle: {
                r: 5,
                magnet: true,
                stroke: '#31d0c6',
                strokeWidth: 2,
                fill: '#fff',
              },
            },
            position: {
              name: 'line',
              args: {
                start: { x: 1, y: topOffset },
                end: { x: 1, y: lineEnd },
              },
            },
          },
        },
        items: itemPoints,
      },
    };
    this.RenderData.nodes.push(nodeData);
  }

  /**
   * 移除表
   * @param tableName
   */
  async RemoveTable(tableName: string) {
    const { nodes } = this.RenderData;
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];
      if (node.id === tableName) {
        nodes.splice(index, 1);
      }
    }
  }

  TableViewName = ``;

  UpdateViewJson(viewJson: any) {
    this.Sql = GraphHelper.toSQl(viewJson);
    return codeWapre(this.Sql, 'sql');
  }

  async SaveTableView() {
    if (this.TableViewName.length < 1) {
      throw `视图名不能为空!`;
    }
    if (this.Sql.length < 1) {
      throw `请检查视图表连接关系,是否完整!`;
    }
    await this.TableFieldMapInstance?.Save();
    const isOK = await createTableView(this.TableViewName, this.Sql);
    return isOK;
  }

  Top = 1;

  Data: Array<any> = [];

  Headers: Array<{
    title: string;
    dataIndex: string;
    width: number;
  }> = [];

  async ExcuteSql() {
    this.Headers.length = 0;
    this.Data.length = 0;
    const param: Dictionary<string, string> = {};
    const { Data } = await ApiTestExcute(this.Sql, param, {
      pageSize: this.Top,
      pageIndex: 1,
      hiSqlparam: {},
    });
    if (!Data || Data.List.length < 1) {
      throw `没有查询到任何数据!`;
    }
    const firstObj = Data.List[0];
    for (const key in firstObj) {
      this.Headers.push({
        title: key,
        dataIndex: key,
        width: 150,
      });
    }
    this.Data.push(...Data.List);
  }

  /**
   * 自定义字段映射组件实例
   */
  TableFieldMapInstance?: typeFieldMapVue;
}
