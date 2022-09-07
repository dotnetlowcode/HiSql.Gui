using HiSql.GUI.Framework.DependencyInjection;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Helper
{
    public class HiSqlConfig : ISingleton
    {
        public HiSqlConfig(IConfiguration configuration)
        {
            DESKey = configuration.GetSection("HiGui:DbType").Value ?? "Aj3y3fXv";
            PwdSalt = configuration.GetSection("HiGui:PwdSalt").Value ?? "Aj3y3fXvPfmnSzO3Dd7mgA==";
            SiteUrl = configuration.GetSection("HiGui:SiteUrl").Value;
            if (SiteUrl == null)
            {
                throw new Exception("请在配置文件中增加节点：HiGui:SiteUrl");
            }
            string dbtype = configuration.GetSection("HiGui:DbConnection:DbType").Value;
            if (dbtype.Equals(DBType.SqlServer.ToString(), StringComparison.OrdinalIgnoreCase))
            {
                DbType = DBType.SqlServer;
            }
            else if (dbtype.Equals(DBType.MySql.ToString(), StringComparison.OrdinalIgnoreCase))
            {
                DbType = DBType.MySql;
            }
            else if (dbtype.Equals(DBType.Oracle.ToString(), StringComparison.OrdinalIgnoreCase))
            {
                DbType = DBType.Oracle;
            }
            else if (dbtype.Equals(DBType.PostGreSql.ToString(), StringComparison.OrdinalIgnoreCase))
            {
                DbType = DBType.PostGreSql;
            }
            else if (dbtype.Equals(DBType.Sqlite.ToString(), StringComparison.OrdinalIgnoreCase))
            {
                DbType = DBType.Sqlite;
            }
            else if (dbtype.Equals(DBType.Hana.ToString(), StringComparison.OrdinalIgnoreCase))
            {
                DbType = DBType.Hana;
            }
            else if (dbtype.Equals(DBType.DaMeng.ToString(), StringComparison.OrdinalIgnoreCase))
            {
                DbType = DBType.DaMeng;
            }
            else
                throw new Exception($"请在配置文件中指定正确的数据库类型");



            Schema = configuration.GetSection("HiGui:DbConnection:Schema").Value;

            ConnectionString= configuration.GetSection("HiGui:DbConnection:ConnectionString").Value;
            DbServer = configuration.GetSection("HiGui:DbConnection:DbServer").Value;

        }

        public string DESKey { get; set; }

        public string PwdSalt { get; set; }

        public string SiteUrl { get; set; }

        /// <summary>
        /// 数据库类型
        /// </summary>

        public DBType DbType { get; set; }

        public string Schema { get; set; }

        public string ConnectionString { get; set; }


        public string DbServer { get; set; }
    }
}
