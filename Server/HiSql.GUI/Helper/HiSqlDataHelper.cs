using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace HiSql.GUI.Helper
{
    public class HiSqlDataHelper
    {
        public static async Task<List<HiColumn>> GetDataTableHiColumn(DataTable dt)
        {
            var columnsList = new List<HiColumn>();
            int iColCount = dt.Columns.Count;
            var firstRow = dt.Rows[0];
            var startIndex = 40961;//A001
            for (int i = 0; i < iColCount; i++)
            {
                //HiSql.SnroNumber.NewNumber("fieldsno", 1);
                DataColumn column = dt.Columns[i];
                var columnName = (startIndex + i).ToString("x4").ToUpper();//转成16进制，4位补零
                var fieldType = DataTableTypeToHiSqlType(column.DataType);
                var fieldDesc = firstRow[i] as string;
                if (Regex.IsMatch(fieldDesc, @"^\[整数\]"))
                {
                    fieldType = HiType.INT;
                }
                else if (Regex.IsMatch(fieldDesc, @"^\[日期\]"))
                {
                    fieldType = HiType.DATETIME;
                }
                var hiColumn = new HiColumn
                {
                    FieldName = columnName,
                    FieldDesc = fieldDesc,
                    FieldType = fieldType,
                    FieldLen = 2000
                };
                column.ColumnName = columnName;
                if (i == 0)
                {
                    hiColumn.IsPrimary = true;
                }
                columnsList.Add(hiColumn);
            }
            return columnsList;
        }

        public static HiType DataTableTypeToHiSqlType(Type dataType)
        {
            if (dataType == typeof(string))
            {
                return HiType.NVARCHAR;
            }
            else if (dataType == typeof(int))
            {
                return HiType.INT;
            }
            else if (dataType == typeof(DateTime))
            {
                return HiType.DATETIME;
            }
            return HiType.NVARCHAR;
        }

    }
}