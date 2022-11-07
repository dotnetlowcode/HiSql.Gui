using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI
{
    public  class CodeFirst : ITransient
    {


        bool createHiSqlGuiTable(HiSqlClient sqlClient)
        {
            bool _isintall = true;
            bool _iscreate = false;
            if (!string.IsNullOrEmpty(HiSql.GUI.Properties.Resources.TabData))
            {
                string json = HiSql.GUI.Properties.Resources.TabData;
                List<Repository.Models.GuiInstallInfo> lstgui = Newtonsoft.Json.JsonConvert.DeserializeObject<List<Repository.Models.GuiInstallInfo>>(json);


                foreach (Repository.Models.GuiInstallInfo guiinfo in lstgui)
                {
                    string _tabname = guiinfo.TabName;
                    if (!guiinfo.IsView)
                    {
                        if (!sqlClient.DbFirst.CheckTabExists(_tabname))
                        {
                            Console.WriteLine($"正在安装HiSql.GUI系统表[{_tabname}]...");
                            string json_tab = guiinfo.TabStructInfo;
                            TabInfo tabinfo = Newtonsoft.Json.JsonConvert.DeserializeObject<TabInfo>(json_tab);
                            _isintall = sqlClient.DbFirst.CreateTable(tabinfo);
                            if (!_isintall)
                            {
                                Console.WriteLine($"Error:安装HiSql.GUI系统表[{_tabname}]失败!");
                            }
                            else
                            {
                                _iscreate = true;
                                if (!string.IsNullOrEmpty(guiinfo.TabDataInfo))
                                {
                                    List<ExpandoObject> lstdyn = Newtonsoft.Json.JsonConvert.DeserializeObject<List<ExpandoObject>>(guiinfo.TabDataInfo);

                                    if (lstdyn.Count > 0)
                                    {
                                        sqlClient.Modi(_tabname, lstdyn).ExecCommand();

                                        Console.WriteLine($"HiSql.GUI系统表[{_tabname}] 数据初始化成功...");
                                    }

                                }
                            }
                        }
                        else
                        {
                            if (!string.IsNullOrEmpty(guiinfo.TabDataInfo))
                            {
                                List<ExpandoObject> lstdyn = Newtonsoft.Json.JsonConvert.DeserializeObject<List<ExpandoObject>>(guiinfo.TabDataInfo);

                                bool hasgui = sqlClient.HiSql("select * from Hi_Version where HiPackName='HiSql.GUI'").ToTable().Rows.Count>0?true:false;

                                if (lstdyn.Count > 0 && !hasgui)
                                { 
                                    //sqlClient.Modi(_tabname, lstdyn).ExecCommand();

                                    Console.WriteLine($"HiSql.GUI系统表[{_tabname}] 数据初始化成功...");
                                }

                            }
                        }
                    }
                    else {
                        if (sqlClient.DbFirst.CheckTabExists(_tabname))
                        {

                            bool hasgui = sqlClient.HiSql("select * from Hi_Version where HiPackName='HiSql.GUI'").ToTable().Rows.Count > 0 ? true : false;
                            if (!hasgui)
                            {
                                var rtn = sqlClient.DbFirst.ModiView(_tabname, guiinfo.ViewHiSql, OpLevel.Execute);

                                if (rtn.Item1)
                                    Console.WriteLine($"HiSql.GUI系统视图[{_tabname}] 修改成功...");
                                else
                                    Console.WriteLine($"HiSql.GUI系统视图[{_tabname}] 修改失败...");
                            }
                        }
                        else
                        {
                            var rtn = sqlClient.DbFirst.CreateView(_tabname, guiinfo.ViewHiSql, OpLevel.Execute);
                            if (rtn.Item1)
                                Console.WriteLine($"HiSql.GUI系统视图[{_tabname}] 创建成功...");
                            else
                                Console.WriteLine($"HiSql.GUI系统视图[{_tabname}] 创建失败...");
                        }
                    }
                }

                if (_iscreate)
                {
                    Version vergui = HiDataInject.getHiSqlGUIVersion();

                    sqlClient.Modi("Hi_Version", new { HiPackName = "HiSql.GUI", Version= vergui.ToString(), VerNum= Convert.ToInt32(vergui.ToString().Replace(".","")) }).ExecCommand();
                }


            }
            else
                _isintall=false;







            //string _tabname = "Hi_UserRole";
            //if (!sqlClient.DbFirst.CheckTabExists(_tabname))
            //{
            //    Console.WriteLine($"正在安装HiSql.GUI系统表[{_tabname}]...");
            //    string str_jsoin = HiSql.GUI.Properties.Resources.TabData;
            //    TabInfo tabinfo = Newtonsoft.Json.JsonConvert.DeserializeObject<TabInfo>(str_jsoin);
            //    _isintall = sqlClient.DbFirst.CreateTable(tabinfo);
            //    if (!_isintall)
            //    {
            //        Console.WriteLine($"Error:安装HiSql.GUI系统表[{_tabname}]失败!");
            //    }
            //}



            return _isintall;
        }
        public  bool InstallHiSqlGui(HiSqlClient sqlClient)
        {

            
            return createHiSqlGuiTable(sqlClient);
        }


    }
}
