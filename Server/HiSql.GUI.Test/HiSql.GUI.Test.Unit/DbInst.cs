using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Test.Unit
{
    internal class DbInst
    {
        public static HiSqlClient GetSqlServerClient()
        {
            return new HiSqlClient(
                 new ConnectionConfig()
                 {
                     DbType = DBType.SqlServer,
                     DbServer = "local-HiSql",
                     ConnectionString = @"server=192.168.10.88,7433;uid=chenwei;pwd=chenwei123;database=Hone_HiData;Encrypt=True; TrustServerCertificate=True;",//; MultipleActiveResultSets = true;
                     //ConnectionString = @"server=(local);uid=sa;pwd=Hone@123;database=Hone;Encrypt=True; TrustServerCertificate=True;",//; MultipleActiveResultSets = true;
                                                                                                                                       //User="tansar",//可以指定登陆用户的帐号

                     //SlaveConnectionConfigs = new List<SlaveConnectionConfig> {
                     //        //{ new SlaveConnectionConfig{ ConnectionString=@"server=172.16.80.253;uid=sa;pwd=Hone@123;database=Hone;Encrypt=True; TrustServerCertificate=True;" , Weight=3} },
                     //        //{ new SlaveConnectionConfig{ ConnectionString=" server=(local);uid=sa;pwd=Hone@123;database=HiSql; " , Weight=3} },
                     //        //{ new SlaveConnectionConfig{ ConnectionString="  server=(local);uid=sa;pwd=Hone@123;database=HiSql;" , Weight=4} },
                     //        //{ new SlaveConnectionConfig{ ConnectionString="    erver=(local);uid=sa;pwd=Hone@123;database=HiSql;" , Weight=10} }

                     //    },

                     Schema = "dbo",
                     IsEncrypt = true,
                     IsAutoClose = false,
                     SqlExecTimeOut = 1,

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
                     }
                 }
                 );
        }
    }
}
