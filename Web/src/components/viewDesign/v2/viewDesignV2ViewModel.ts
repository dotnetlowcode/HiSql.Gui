import { List } from 'linqts';

/* eslint-disable no-use-before-define */
import { ArrayRemoveItem, Dictionary } from '@/helper/arrayHelper';
import { ApiTestExcute } from '@/serverApi/databaseAPIs';
import { TableGetColumnsRequest } from '@/serverApi/request/table/tableGetColums';
import {
  createTableView,
  getTableInfo,
  getTableViewDesign,
  saveTableViewExt,
} from '@/serverApi/tableInfoAPIs';
import { tableDataAdd } from '@/serverApi/tableDataAPIs';

/**
 * 表字段
 */
export class TableField {
  /**
   * 字段展示名
   */
  Title = ``;

  /**
   * 字段名
   */
  Id = ``;

  /**
   * 表名
   */
  TableName = ``;

  /**
   * 是否选中
   */
  Select?: boolean;
}

/**
 * 表字段(分组)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class TableFieldGroup {
  /**
   * 表名(因组件格式需求用FieldName)
   */
  FieldName = ``;

  // eslint-disable-next-line lines-between-class-members
  /**
   * 子集
   */
  ChildList?: Array<TableField>;
}

class ConditionField {
  TableName: string = '';

  FieldName: string = '';
}
class ConditionType {
  /**
   * 等号左边字段
   */
  Left: ConditionField = new ConditionField();

  /**
   * 等号右边字段
   */
  Right: ConditionField = new ConditionField();
}

/**
 * 连接操作符
 */
type JoinType = 'LeftJoin' | 'RightJoin' | 'InnerJoin';

/**
 * 连接操作符类型
 */
export class JoinTypeObj {
  LeftJoin: string = 'LeftJoin';

  RightJoin: string = 'RightJoin';

  InnerJoin: string = 'InnerJoin';
}

/**
 * 表信息
 */
class JoinTableInfo {
  /**
   * 表名
   */
  TableName = '';

  /**
   * 表描述
   */
  TableDesc = '';
}

/**
 * 连接表信息
 */
export class JoinTable {
  /**
   * 表名
   */
  Table: JoinTableInfo = new JoinTableInfo();

  /**
   * 显示的表字段
   */
  FieldList: Array<TableField> = [];

  /**
   * 显示的表字段(分组左)
   */
  FieldListLeftOptions: Array<TableFieldGroup> = [];

  /**
   * 显示的表字段(分组右)
   */
  FieldListRightOptions: Array<TableFieldGroup> = [];

  /**
   * 选择的表字段
   */
  SelectFields: Array<TableField> = [];

  /**
   *  字段是否全选
   */

  CheckAll: boolean = false;

  /**
   * 连接类型
   */
  JoinType: JoinType = 'LeftJoin';

  /**
   * 连接条件
   */
  Conditions: Array<ConditionType> = [];
}

const stateFields: Array<`JoinTables` | `Data` | `Headers`> = [`JoinTables`, `Data`, `Headers`];

export class ViewDesignV2ViewModel {
  JoinTables: Array<JoinTable> = [];

  TableViewName = '';

  Data: Array<any> = [];

  Headers: Array<{
    title: string;
    dataIndex: string;
    width: number;
    ellipsis?: boolean;
  }> = [];

  Top = 50;

  /**
   * 添加连接表项
   */
  async AddJoinTable() {
    const joinTable = new JoinTable();
    this.JoinTables.push(joinTable);
  }

  /**
   *关联字段分组
   */
  async groupFieldList(obj: JoinTable, curIndex: number) {
    const groupLeftList: Array<TableFieldGroup> = [];
    const groupRightList: Array<TableFieldGroup> = [];
    const fieldGroupObjRight = new List(obj.FieldList).GroupBy(r => r.TableName);
    let item: TableFieldGroup = {
      FieldName: '',
      ChildList: [],
    };
    for (const key in fieldGroupObjRight) {
      item = JSON.parse(JSON.stringify(item));
      if (Object.prototype.hasOwnProperty.call(fieldGroupObjRight, key)) {
        const element = fieldGroupObjRight[key];
        item.FieldName = key;
        item.ChildList = element;
        if (curIndex === 0) {
          groupLeftList.push(item);
        }
        groupRightList.push(item);
      }
    }
    obj.FieldListRightOptions.length = 0;
    if (curIndex > 0) {
      obj.FieldListRightOptions.length = 0;
      obj.FieldListRightOptions.push(...groupRightList);
      groupLeftList.push(...this.JoinTables[curIndex - 1].FieldListLeftOptions);
      groupLeftList.push(...this.JoinTables[curIndex - 1].FieldListRightOptions);
    }
    obj.FieldListLeftOptions.length = 0;
    obj.FieldListLeftOptions.push(...groupLeftList);
  }

  /**
   * 设置关联表
   * @param obj
   * @param newTableName
   */
  async ChangeTableName(obj: JoinTable, newTableName: string) {
    if (obj.Table.TableName === '') {
      return;
    }
    const req = new TableGetColumnsRequest();
    req.TableName = newTableName;
    const { Data } = await getTableInfo(newTableName);
    const tableColumList = Data?.TabColumns ?? [];
    obj.FieldList.length = 0;
    tableColumList.forEach(r => {
      obj.FieldList.push({
        Title: `${r.FieldName}[${r.FieldDesc}]`,
        Id: r.FieldName,
        TableName: r.TabName,
      });
    });
    obj.Table.TableName = Data?.TabProps.TabName ?? '';
    obj.Table.TableDesc = Data?.TabProps.TabDescript ?? '';

    // 设置初始化连接条件
    if (obj.Conditions.length === 0) {
      const item = new ConditionType();
      obj.Conditions.push(item);
    }
  }

  /**
   * 删除表连接
   * @param obj
   */
  async DeleteJoinTable(obj: JoinTable) {
    this.JoinTables.splice(this.JoinTables.indexOf(obj), 1);
  }

  /**
   * 给表连接项增加条件语句
   * @param obj
   */
  async AddJoinTableConditionItem(obj: JoinTable) {
    obj.Conditions.push(new ConditionType());
  }

  /**
   * 移除集合中的条件项
   * @param obj
   * @param condition
   */
  async RemoveTableConditionItem(obj: JoinTable, condition: ConditionType) {
    ArrayRemoveItem(obj.Conditions, condition);
  }

  /**
   * 设置条件绑定字段
   * @param condition
   * @param itemType
   * @param tableName
   * @param fieldName
   */
  async SetConditionField(
    condition: ConditionType,
    itemType: 'Left' | 'Right',
    tableName: string,
    fieldName: string,
  ) {
    if (itemType === 'Left') {
      condition.Left.TableName = tableName;
      condition.Left.FieldName = fieldName;
    } else if (itemType === 'Right') {
      condition.Right.TableName = tableName;
      condition.Right.FieldName = fieldName;
    }
  }

  /**
   * 设置连接方式
   * @param obj
   * @param join
   */
  async SetJoinType(obj: JoinTable, join: JoinType) {
    obj.JoinType = join;
  }

  /**
   * 执行查询
   * @param joinTableIndex 执行索引
   * @returns 视图SQL
   */
  async QuerySqlBuild(joinTableIndex?: number) {
    console.log('执行查询!');
    const excuteTables =
      joinTableIndex === undefined || joinTableIndex === 0
        ? this.JoinTables
        : this.JoinTables.slice(1, joinTableIndex + 1);
    let fieldsStr = ``;
    const [mainTable] = excuteTables;
    if (!mainTable.Table.TableName) {
      throw '请至少选择一个要查询的表!';
    }
    mainTable.SelectFields.forEach(f => {
      fieldsStr += `${f.TableName}.${f.Id},`;
    });
    let sqlJoin = '';
    for (let index = 1; index < excuteTables.length; index++) {
      const joinTable = excuteTables[index];
      if (!joinTable.Table.TableName) {
        throw `在第${index + 1}个关键项中,请选择要关联的表!`;
      }
      let onStr = '';
      joinTable.Conditions.forEach(c => {
        onStr += `${c.Left.TableName}.${c.Left.FieldName}=${c.Right.TableName}.${c.Right.FieldName} and`;
      });
      let joinTableFields = '';
      joinTable.SelectFields.forEach(f => {
        joinTableFields += `${f.TableName}.${f.Id},`;
      });
      fieldsStr += joinTableFields;
      onStr = onStr.replace(/and$/gi, ''); // 去除结尾and
      let joinType = 'left';
      switch (joinTable.JoinType) {
        case 'InnerJoin':
          joinType = 'inner';
          break;
        case 'LeftJoin':
          joinType = 'left';
          break;
        case 'RightJoin':
          joinType = 'right';
          break;
      }
      sqlJoin += ` ${joinType} join ${joinTable.Table.TableName} on ${onStr}`;
    }
    fieldsStr = fieldsStr.replace(/,$/gi, ''); // 去除结尾,
    if (fieldsStr.length < 1) {
      throw '请至少选择一个要查询的列!';
    }
    const sql = `select ${fieldsStr} from ${mainTable.Table.TableName} ${sqlJoin}`;
    return sql;
  }

  /**
   * 执行视图
   */
  async ExcuteSql(joinTableIndex?: number) {
    this.Headers.length = 0;
    this.Data.length = 0;
    const param: Dictionary<string, string> = {};
    const sql = await this.QuerySqlBuild(joinTableIndex);
    const { Data } = await ApiTestExcute(sql, param, {
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
        ellipsis: true,
      });
    }
    this.Data.push(...Data.List);
  }

  /**
   * 保存视图
   * @returns
   */
  async SaveTableView() {
    if (this.TableViewName.length < 1) {
      throw `视图名不能为空!`;
    }
    const sql = await this.QuerySqlBuild();
    if (sql.length < 1) {
      throw `请检查视图表连接关系,是否完整!`;
    }
    const isOK = await createTableView(this.TableViewName, sql);
    const viewDesingn = {
      JoinTables: this.JoinTables,
      Data: this.Data,
      Headers: this.Headers,
    };
    await saveTableViewExt(this.TableViewName, viewDesingn);
    return isOK;
  }

  /**
   * 加载表信息
   */
  async LoadTableView() {
    const extObj = await getTableViewDesign(this.TableViewName);
    if (extObj) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      stateFields.forEach(propName => {
        self[propName] = extObj[propName];
      });
    }
  }
}
