using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HiData.Framework;
using HiSql;
using HiSql.GUI.Helper;
using HiSql.GUI.Repository.Interface;
using HiSql.GUI.Repository.Models;

namespace HiSql.GUI.Repository.HisSqlRepository
{
    public class HiExcelRepository : ITransient
    {
        /// <summary>
        /// Excel模板导出表名
        /// </summary>
        public static readonly string HiExcelExportTemplateTableName = "Hi_ExcelExportTemplate";

        /// <summary>
        /// Excel模板列映射表名
        /// </summary>
        public static readonly string HiExcelHeaderMapTableName = "Hi_ExcelHeaderMap";

        /// <summary>
        /// Excel模板Sheet配置表名
        /// </summary>
        public static readonly string HiExcelTemplateSheetTableName = "Hi_ExcelTemplateSheet";

        HiSqlClient sqlClient;
        public HiExcelRepository(HiSqlClient _hiSqlClient)
        {
            sqlClient = _hiSqlClient;
        }


        public async Task<(HiExcelExportTemplateEntity, List<HiExcelTemplateSheetModel>, List<HiExcelHeaderMapEntity>)> GetExcelExport(string templateId)
        {
            try
            {
                var excelExportObj = sqlClient.Query(HiExcelExportTemplateTableName).Field("*").Where(new Filter
                {
                    { "TemplateId",OperType.EQ,templateId }
                }).ToList<HiExcelExportTemplateEntity>().FirstOrDefault();
                if (excelExportObj == null)
                {
                    throw new Exception("数据不存在!");
                }
                var sheetList = sqlClient.Query(HiExcelTemplateSheetTableName).Field("*").Where(new Filter
                {
                    { "TemplateId",OperType.EQ,templateId }
                }).ToList<HiExcelTemplateSheetModel>();
                var sheetColumnMapList = sqlClient.Query(HiExcelHeaderMapTableName).Field("*").Where(new Filter
                {
                    { "TemplateId",OperType.EQ,templateId }
                }).ToList<HiExcelHeaderMapEntity>();
                return (excelExportObj, sheetList, sheetColumnMapList);
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }


        /// <summary>
        /// 保存Excel配置
        /// </summary>
        /// <param name="excelExportTemplate"></param>
        /// <param name="sheets"></param>
        /// <param name="maps"></param>
        /// <returns></returns>
        public async Task<bool> SaveExcelExport(
            HiExcelExportTemplateEntity excelExportTemplate,
            List<HiExcelTemplateSheetModel> sheets,
            List<HiExcelHeaderMapEntity> maps
            )
        {
            try
            {
                //main
                sqlClient.BeginTran(System.Data.IsolationLevel.ReadCommitted);
                await sqlClient.Modi(HiExcelExportTemplateTableName, excelExportTemplate).ExecCommandAsync();
                //sheet
                await sqlClient.Delete(HiExcelTemplateSheetTableName).Where(new Filter {
                    excelExportTemplate.TemplateId
                }).ExecCommandAsync();
                await sqlClient.Insert(HiExcelTemplateSheetTableName, sheets).ExecCommandAsync();
                //map
                await sqlClient.Delete(HiExcelHeaderMapTableName).Where(new Filter {
                    excelExportTemplate.TemplateId
                }).ExecCommandAsync();
                await sqlClient.Insert(HiExcelHeaderMapTableName, maps).ExecCommandAsync();
                sqlClient.CommitTran();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                sqlClient.RollBackTran();
            }
            return true;
        }


    }
}