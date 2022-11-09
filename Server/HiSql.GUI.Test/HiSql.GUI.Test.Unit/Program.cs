using System;
using System.Collections.Generic;
using System.Dynamic;

namespace HiSql.GUI.Test.Unit
{
    internal class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello World!");
            List<string> lsttab = new List<string>();
            lsttab.Add("Hi_Domain");
            lsttab.Add("Hi_DataElement");
            lsttab.Add("Hi_DataType");
            lsttab.Add("Hi_Module");
            lsttab.Add("Hi_ModuleTypeOperate");
            lsttab.Add("Hi_Role");
            lsttab.Add("Hi_RoleModuleMap");
            lsttab.Add("Hi_Group");
            lsttab.Add("Hi_UserInfo");
            lsttab.Add("Hi_UserRole");
            lsttab.Add("Hi_Api");
            lsttab.Add("Hi_ApiBlock");
            lsttab.Add("Hi_ApiParam");
            lsttab.Add("Hi_Chart");
            lsttab.Add("Hi_ChartDashboard");
            lsttab.Add("Hi_ChartField");
            lsttab.Add("Hi_ChartShared");
            lsttab.Add("Hi_ChartSharedLog");
            lsttab.Add("Hi_ExcelExportTemplate");
            lsttab.Add("Hi_ExcelHeaderMap");
            lsttab.Add("Hi_ExcelTemplateSheet");
            lsttab.Add("Hi_FieldMap");
            lsttab.Add("Hi_QueueTask");
            lsttab.Add("Hi_Task");
            lsttab.Add("Hi_Task_Log");
            lsttab.Add("Hi_FieldModel");
            lsttab.Add("Hi_FieldModelExt");
            lsttab.Add("Hi_TabModel");
            lsttab.Add("Hi_ExcelExportTemplate");
            lsttab.Add("Hi_ExcelHeaderMap");
            lsttab.Add("Hi_ExcelTemplateSheet");

            lsttab.Add("Hi_vw_UserAuth");


            Dictionary<string, string> dic_view = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            dic_view.Add("Hi_vw_UserAuth", "SELECT   Hi_RoleModuleMap.MId, Hi_RoleModuleMap.RefValues, Hi_UserInfo.UId, Hi_RoleModuleMap.ResId,     Hi_UserInfo.RId AS UserRId FROM      Hi_RoleModuleMap LEFT OUTER JOIN   Hi_Role ON Hi_RoleModuleMap.RId = Hi_Role.RId LEFT OUTER JOIN   Hi_Group ON Hi_Role.RId = Hi_Group.RId LEFT OUTER JOIN  Hi_UserInfo ON Hi_Role.RId = Hi_UserInfo.RId OR Hi_Group.GId = Hi_UserInfo.GId");




            List< GuiInstallInfo > lstgui = Newtonsoft.Json.JsonConvert.DeserializeObject<List<GuiInstallInfo>>(HiSql.GUI.Test.Unit.Properties.Resources.TabData);


            HiSqlClient sqlClient = DbInst.GetSqlServerClient();

            List<GuiInstallInfo> lstguiinfo = new List<GuiInstallInfo>();


            foreach (string  tabname in lsttab)
            {
                Console.WriteLine($"表名:{tabname}");
                GuiInstallInfo ginfo = new GuiInstallInfo();
                TabInfo tabinfo = sqlClient.DbFirst.GetTabStruct(tabname);
                if (tabinfo != null)
                {
                    ginfo.TabName = tabname;
                    ginfo.TabStructInfo= Newtonsoft.Json.JsonConvert.SerializeObject(tabinfo);

                    Console.WriteLine($"获取表[{tabinfo.TabModel.TabName}]的结构信息成功");

                    List<ExpandoObject> lstdyn = sqlClient.HiSql($"select * from {tabname}").ToEObject();
                    if (lstdyn.Count > 0)
                    {
                        string datajson = Newtonsoft.Json.JsonConvert.SerializeObject(lstdyn);
                        ginfo.TabDataInfo = datajson;

                    }
                    if (tabinfo.TabModel.TabType == TabType.View)
                    {
                        Console.WriteLine($"当前是一个视图...");

                        ginfo.IsView = true;
                        if (dic_view.ContainsKey(tabname))
                            ginfo.ViewHiSql = dic_view[tabname];
                        else
                        {
                            throw new Exception($"[{tabname}]是视图 请未配置HiSql的视图语句");
                        }
                    }
                    lstguiinfo.Add(ginfo);

                }
                else
                    Console.WriteLine($"获取表[{tabinfo.TabModel.TabName}]的结构信息失败");
            }


            //Console.WriteLine(HiSql.GUI.Test.Unit.Properties.Resources.TabData);

            if (lstguiinfo.Count > 0)
            { 
                string json= Newtonsoft.Json.JsonConvert.SerializeObject(lstguiinfo);

                Console.WriteLine(json);
            }


            var s = Console.ReadLine();
        }
    }
}
