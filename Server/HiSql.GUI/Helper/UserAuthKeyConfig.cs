using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Helper
{

    public class UserRoleConfig
    {
        /// <summary>
        /// 超级管理员
        /// </summary>
        public static string SuperAdmin = "superAdmin";

        /// <summary>
        /// 系统管理员
        /// </summary>
        public static string SystemAdmin = "systemAdmin";
    }

    public  class UserAuthKeyConfig
    {
        public static string HiTablelistadd = "hiTable-list-add";//[新增]
        public static string HiTablelistdelete = "hiTable-list-delete";//[删除]
        public static string HiTabletableStructedit = "hiTable-tableStruct-edit";//[编辑]
        public static string HiTabletableStructquery = "hiTable-tableStruct-query";//[查看]
        public static string HiTabletableStructupdate = "hiTable-tableStruct-update";//[修改]
        public static string HiTabletableDataquery = "hiTable-tableData-query";//[查看]
        public static string HiTabletableDataadd = "hiTable-tableData-add";//[增加]

        /// <summary>
        /// [删除]
        /// </summary>
        public static string HiTabletableDatadelete = "hiTable-tableData-delete";

        /// <summary>
        /// [清空表]
        /// </summary>
        public static string HiTabletableDatatruncate = "hiTable-tableData-truncate";
        public static string HiTabletableDataupdate = "hiTable-tableData-update";//[修改]
        public static string HiTabletableApiquery = "hiTable-tableApi-query";//[查看]
        public static string HiTabletableChartquery = "hiTable-tableChart-query";//[查看]
        public static string HiTabletableChartedit = "hiTable-tableChart-edit";//[编辑]
        public static string HiTabletableChartupdate = "hiTable-tableChart-update";//[修改]
        public static string HiTabletableChartdelete = "hiTable-tableChart-delete";//[删除]
        public static string HiTabletableChartshared = "hiTable-tableChart-shared";//[分享]
        public static string HiTableViewlistadd = "hiTableView-list-add";//[新增]
        public static string HiTableViewlistdelete = "hiTableView-list-delete";//[删除]
        public static string HiTableViewtableViewStructupdate = "hiTableView-tableViewStruct-update";//[修改]
        public static string HiTableViewtableViewStructquery = "hiTableView-tableViewStruct-query";//[查看]
        public static string HiTableViewtableViewStructedit = "hiTableView-tableViewStruct-edit";//[编辑]
        public static string HiTableViewtableViewDataquery = "hiTableView-tableViewData-query";//[查看]
        public static string HiTableViewtableViewApiquery = "hiTableView-tableViewApi-query";//[查看]
        public static string HiTableViewtableViewChartdelete = "hiTableView-tableViewChart-delete";//[删除]
        public static string HiTableViewtableViewChartshared = "hiTableView-tableViewChart-shared";//[分享]
        public static string HiTableViewtableViewChartquery = "hiTableView-tableViewChart-query";//[查看]
        public static string HiTableViewtableViewChartedit = "hiTableView-tableViewChart-edit";//[编辑]
        public static string HiTableViewtableViewChartupdate = "hiTableView-tableViewChart-update";//[修改]
        public static string HiApilistadd = "hiApi-list-add";//[新增]
        public static string HiApilistedit = "hiApi-list-edit";//[编辑]
        public static string HiApilistdelete = "hiApi-list-delete";//[删除]
        public static string HiTasklistedit = "hiTask-list-edit";//[编辑]
        public static string HiTasklistadd = "hiTask-list-add";//[新增]
        public static string HiTasklistdelete = "hiTask-list-delete";//[删除]
        public static string HiExcelTemplatelistadd = "hiExcelTemplate-list-add";//[新增]
        public static string HiExcelTemplatelistedit = "hiExcelTemplate-list-edit";//[编辑]
        public static string HiExcelTemplatelistdelete = "hiExcelTemplate-list-delete";//[删除]
    }
}
