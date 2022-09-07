using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Helper {
    public class HiSqlDataHelper {
        public static async Task<TabInfo> DataTableToTableInfo (string tableName, DataTable dt) {
            var hiTable = new HiTable () {
                TabName = tableName
            };
            var columnsList = new List<HiColumn> ();
            int iColCount = dt.Columns.Count;
            for (int i = 0; i < iColCount; i++) {
                DataColumn column = dt.Columns[i];
                var hiColumn = new HiColumn ();
                hiColumn.FieldName = column.ColumnName;
                hiColumn.FieldType = DataTableTypeToHiSqlType (column.DataType);
                hiColumn.FieldLen = 50000;
                columnsList.Add (hiColumn);
            }
            return new TabInfo (hiTable, columnsList);
        }

        public static HiType DataTableTypeToHiSqlType (Type dataType) {
            if (dataType == typeof (string)) {
                return HiType.NVARCHAR;
            } else if (dataType == typeof (int)) {
                return HiType.INT;
            } else if (dataType == typeof (DateTime)) {
                return HiType.DATETIME;
            }
            return HiType.NVARCHAR;
        }

    }
}