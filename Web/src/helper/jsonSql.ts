/* eslint-disable no-use-before-define */
class JsonSql {
  SelectFiled: string[] = [];

  TableName = ``;
}

class JoinOn {
  tableA: string;

  tableB: string;

  tableBField: string;

  tableAFiled: string;

  constructor(tableA: string, tableAFiled: string, tableB: string, tableBField: string) {
    this.tableA = tableA;
    this.tableAFiled = tableAFiled;
    this.tableB = tableB;
    this.tableBField = tableBField;
  }
}
class JoinTable {
  tableName: string;

  on: JoinOn;

  constructor(tableName: string, on: JoinOn) {
    this.tableName = tableName;
    this.on = on;
  }
}

class ExtJsonSql {
  select = ``;

  from = ``;

  where: Array<SqlFilter> = [];
}

// class JsonSqlBuild<T> {
//   items: Array<ExtJsonSql | JoinOn | JoinTable | SqlFilter> = [];
// }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const k =
  //   : {
  //   select: string;
  //   from: string;
  //   leftJoin:
  //     | {
  //         tableName: string;
  //         as: string;
  //       }
  //     | string;
  //   on: {
  //     leftColumn: string;
  //     rightColumn: string;
  //   };
  //   where: SqlFilter[];
  // }

  {
    select: '*',
    from: 'A',
    join: [
      {
        leftJoin: {
          tableName: 'tableB',
          as: 'b',
          on: {
            leftColumn: '',
            rightColumn: '',
          },
        },
      },
    ],
    where: [],
  };
type tableColumn =
  | string
  | {
      /**
       * 表名或别名
       */
      tableName: string;
      /**
       * 字段名
       */
      fieldName: string;
    };
type leftJoin = {
  leftJoin: {
    tableName: string;
    as: string;
    on: {
      leftColumn: tableColumn;
      rightColumn: tableColumn;
    };
  };
};

type rightJoin = {
  rightJoin: {
    /**
     * 表名
     */
    tableName: string;

    /**
     * 表别名
     */
    as: string;

    /**
     * 联表条件
     */
    on: {
      leftColumn: tableColumn;
      rightColumn: tableColumn;
    };
  };
};

class SqlFilter {
  fieldName: string;

  value: string | JsonQuery;

  operate: string;

  FilderJoin: 'or' | 'and' = 'and';

  constructor(fieldName: string, operate: string, value: string) {
    this.fieldName = fieldName;
    this.operate = operate;
    this.value = value;
  }
}

class JsonQuery {
  select: Array<tableColumn> = [];

  from:
    | {
        tableName: string;
        as: string;
      }
    | string = '';

  join: Array<leftJoin | rightJoin> = [];

  where: Array<SqlFilter> = [];

  toSql() {
    return ``;
  }
}
