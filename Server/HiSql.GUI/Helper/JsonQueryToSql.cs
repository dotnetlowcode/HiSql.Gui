using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace HiSql.GUI.Helper
{
    public class JsonQueryHelper
    {

        static readonly List<string> joinChars = new List<string> {
           "$or","$and"
        };


        static readonly Dictionary<string, string> query = new Dictionary<string, string>() {
            {"$or","or" },
            {"$and","and" },
            {"$gt",">" },
            {"$gtl",">=" },
            {"$lt","<" },
            {"$tle","<=" },
        };

        /// <summary>
        ///防Sql 注入
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public static string ToSqlInject(string? value)
        {
            if (!string.IsNullOrWhiteSpace(value))
            {
                value = value.Replace("'", "''");
            }
            return value ?? string.Empty;
        }

        /// <summary>
        /// 解析值展示
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public static string analyzeSqlValue(JToken? value)
        {
            string? valueStr = "";
            switch (value.Type)
            {
                case JTokenType.None:
                    break;
                case JTokenType.Object:
                    break;
                case JTokenType.Array:
                    break;
                case JTokenType.Constructor:
                    break;
                case JTokenType.Property:
                    break;
                case JTokenType.Comment:
                    break;
                case JTokenType.Integer:
                    valueStr = value.Value<int>().ToString();
                    break;
                case JTokenType.Float:
                    break;
                case JTokenType.String:
                    valueStr = value.Value<string>();
                    var values = valueStr.Split(",").Select(r => ToSqlInject(r)).ToArray();
                    if (values.Length > 1)
                    {
                        //如果是日期类型加上单引号
                        if (values.Length == 2
                            && Regex.IsMatch(values[0], "[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}"))
                        {
                            values = values.Select(r => $"'{r}'").ToArray();
                            valueStr = $"between {values[0]} and {values[1]}";
                        }
                        else
                        {
                            valueStr = $"({string.Join(",", values)})";
                        }
                    }
                    break;
                case JTokenType.Boolean:
                    valueStr = value.Value<bool>().ToString();
                    break;
                case JTokenType.Null:
                    break;
                case JTokenType.Undefined:
                    break;
                case JTokenType.Date:
                    valueStr = $"{value.Value<DateTime>():yyyy-MM-dd hh:mm:ss}";
                    break;
                case JTokenType.Raw:
                    break;
                case JTokenType.Bytes:
                    break;
                case JTokenType.Guid:
                    break;
                case JTokenType.Uri:
                    break;
                case JTokenType.TimeSpan:
                    break;
                default:
                    break;
            }
            return valueStr;
        }

        public static string JsonWhereToSql(JObject? whereJson)
        {
            string sql = string.Empty;
            if (whereJson == null)
            {
                return sql;
            }
            var props = whereJson.Properties();
            foreach (var prop in props)
            {
                string tempSql = string.Empty;
                var pName = prop.Name;
                var propValue = whereJson[pName];
                if (propValue?.Type == JTokenType.Object)
                {
                    tempSql += JsonWhereToSql((JObject)propValue);
                }
                else if (propValue?.Type == JTokenType.Array)
                {
                    var valueArray = propValue as JArray;
                    if (valueArray?.Count == 2)
                    {
                        var beginValue = valueArray[0];
                        var endValue = valueArray[1];
                        tempSql += $"{pName}>='{analyzeSqlValue(beginValue)}' and {pName}<='{analyzeSqlValue(endValue)}'";
                    }
                }
                else if (query.ContainsKey(prop.Name))
                {
                    tempSql += $"{query[prop.Name]}{propValue}";
                }
                else
                {
                    var sqlValue = analyzeSqlValue(propValue);
                    //if (sqlValue == string.Empty)
                    //{
                    //    continue;
                    //}
                    if (sqlValue.Contains(","))
                    {
                        tempSql += $"{prop.Name} in {sqlValue}";
                    }
                    else if (sqlValue.StartsWith("between"))
                    {
                        tempSql += $"{prop.Name} {sqlValue}";
                    }
                    else
                    {
                        tempSql += $"{prop.Name}='{sqlValue}'";
                    }
                }
                sql += " and " + tempSql;
            }
            if (sql.Length > 5)
            {
                Range startIndex = 5..;
                return sql[startIndex];
            }
            return sql;
        }
    }
}
