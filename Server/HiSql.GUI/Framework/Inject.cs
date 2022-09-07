using HiData.Framework.DependencyInjection;
using HiSql.GUI.Controllers;
using HiSql.Gui.WebApi.Controllers;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using HiSql.GUI.TimeJob;
using Microsoft.AspNetCore.Http;
using HiSql.GUI.Helper;

namespace HiSql.GUI
{
    public static class HiDataInject
    {

        static public IServiceCollection AddHiDataMannger(this IServiceCollection services)
        {
            //跨域处理
            services.AddCors(r =>
             {
                 r.AddPolicy("HiDataCors", corsPolicy =>
                 {
                     corsPolicy.AllowAnyOrigin();
                     corsPolicy.AllowAnyMethod();
                     corsPolicy.AllowAnyHeader();
                     //设置预检缓存时间
                     corsPolicy.SetPreflightMaxAge(TimeSpan.FromMinutes(20));
                 });
             });
            //扫描注入
            services.InjecHiData();
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddNodeServices();

            //services.AddControllersWithViews().AddRazorRuntimeCompilation(options =>
            //{
            //    options.FileProviders.Add(new EmbeddedFileProvider(typeof(HiSql.WebUI.Controllers.LoginController).GetType().Assembly));
            //});


            //services.ConfigureOptions(typeof(UIConfigureOptions));



            return services;
        }


        public static IApplicationBuilder UseHiSqlGuiInstall(this IApplicationBuilder app)
        {
            HiSqlClient sqlClient = app.ApplicationServices.GetService<HiSqlClient>();

            sqlClient.CurrentConnectionConfig.User = "HiSql";
            app.UseMiddleware<GuiExceptionMiddleware>();

            Colorful.Console.WriteAscii("HiSqlGui", Colorful.FigletFont.Default, System.Drawing.Color.Green);

            //先执行HiSql安装




            sqlClient.CodeFirst.InstallHisql();

            Version ver = HiSql.Constants.HiSqlVersion;

            Console.WriteLine($"当前HiSql版本:{ver.ToString()}");
            List<string> dblist = HiSql.Constants.DbCurrentSupportList;

            Console.WriteLine($"当前已经安装的数据库包：");
            foreach (string n in dblist)
            {
                Version _ver = HiSql.Constants.GetDbTypeVersion(n);
                Console.WriteLine($"\t{n}.DLL\t{_ver.ToString()}");
            }

            Version vergui = getHiSqlGUIVersion();

            Console.WriteLine($"当前HiSql.GUI版本:{vergui.ToString()}");


            var hisqlgui = app.ApplicationServices.GetService<CodeFirst>();
            if (hisqlgui.InstallHiSqlGui(sqlClient))
            {
                Console.WriteLine($"HiSql.GUI 相关系统表已经存在");
            }
            else
                Console.WriteLine($"HiSql.GUI 相关系统表安装失败");




            return app;
        }

         internal static Version getHiSqlGUIVersion()
        {
            Assembly _assembly = null;
            try
            {
                _assembly = Assembly.Load($"{Constants.NameSpace}.GUI");
                //_assembly = Assembly.Load($"{Constants.NameSpace}");

                return _assembly.GetName().Version;
            }
            catch (Exception E)
            {
                return null;


            }
        }


        /// <summary>
        /// 初始化前端页面
        /// </summary>
        /// <param name="app"></param>
        /// <param name="webPath">页面请求前缀，默认是/hidataweb，访问路径/hidataweb/index.html</param>
        /// <returns></returns>
        public static IApplicationBuilder UseHiDataWeb(this IApplicationBuilder app, string webPath = "/hidataweb")
        {

            var assembly = Assembly.GetExecutingAssembly();
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new EmbeddedFileProvider(assembly, "HiSql.GUI.wwwroot"),
                RequestPath = webPath
            });
            var dowloadPath = $"{AppContext.BaseDirectory}/dowload";
            if (!Directory.Exists(dowloadPath))
            {
                Directory.CreateDirectory(dowloadPath);
            }
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(dowloadPath),  //new EmbeddedFileProvider(assembly, "HiSql.GUI.wwwroot"),
                RequestPath = "/dowload"
            });
            app.ApplicationServices.GetService<QuartzExtend>();
            var config = app.ApplicationServices.GetService<HiSqlConfig>();
            Console.WriteLine($"{config.SiteUrl}/hidataweb/index.html#/login");
            return app;
        }

    }
}
