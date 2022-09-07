using HiSql;
using HiSql.GUI.Framework.DependencyInjection;

namespace HiSql.Gui.WebApi.Helper
{
    public class HiSqlConfig : ConnectionConfig, ISingleton
    {
        public HiSqlConfig(IConfiguration configuration)
        {
            DbType = (DBType)Enum.Parse(typeof(DBType), configuration.GetSection("HiGui:DbConnection:DbType").Value);
            DbServer = configuration.GetSection("HiGui:DbConnection:DbServer").Value;
            ConnectionString = configuration.GetSection("HiGui:DbConnection:ConnectionString").Value;

            Schema = configuration.GetSection("HiGui:DbConnection:Schema").Value;
            IsEncrypt = true;
            IsAutoClose = false;
            SqlExecTimeOut = 1000 * 5;
            AppEvents = new AopEvent()
            {
                OnDbDecryptEvent = (connstr) =>
                {
                    //解密连接字段
                    //Console.WriteLine($"数据库连接:{connstr}");

                    return connstr;
                },
                OnLogSqlExecuting = (sql, param) =>
                {
                    //sql执行前 日志记录 (异步)

                    //Console.WriteLine($"sql执行前记录{sql} time:{DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss ffff")}");
                },
                OnLogSqlExecuted = (sql, param) =>
                {
                    //sql执行后 日志记录 (异步)
                    //Console.WriteLine($"sql执行后记录{sql} time:{DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss ffff")}");
                },
                OnSqlError = (sqlEx) =>
                {
                    //sql执行错误后 日志记录 (异步)
                    Console.WriteLine(sqlEx.Message.ToString());
                },
                OnTimeOut = (int timer) =>
                {
                    //Console.WriteLine($"执行SQL语句超过[{timer.ToString()}]毫秒...");
                }
            };
        }

    }
}