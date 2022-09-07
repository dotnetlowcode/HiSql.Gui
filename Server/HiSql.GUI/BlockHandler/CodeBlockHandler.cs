using HiSql.GUI.ApiModes.DataBase;
using HiSql.GUI.Repository.Models;
using Microsoft.AspNetCore.NodeServices;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.BlockHandler
{
    public class CodeBlockHandler : IBlockHandler
    {
        INodeServices nodeService;
        public CodeBlockHandler(INodeServices _nodeService)
        {
            nodeService = _nodeService;
        }
        public override Task<BlockResult> HiApiBlockExcute(HiApiBlockSimpleEntity blockEntity,
            List<HiApiParamEntitySimple> paramList,
            ExpandoObject globalParam,
            Dictionary<string, List<IDictionary<string, object>>> blockResultMap)
        {
            var paramMap = new Dictionary<string, object>();
            paramList.ForEach(param =>
            {
                var pathArray = param.ValueFrom.Split('.');
                var blockIndex = pathArray[0];
                var propName = pathArray[1];
                if (blockIndex == "0")//全局参数
                {
                    paramMap[param.Title] = ((IDictionary<string, object>)globalParam)[propName];
                }
                else
                {
                    var table = blockResultMap[blockIndex];
                    if (table.Count > 0)
                    {
                        //if (valueIsArray)
                        //{
                        //    var values = new List<object>();
                        //    table.ForEach(rowIedtem =>
                        //    {
                        //        values.Add(rowIedtem[r.Title]);
                        //    });
                        //    sqlParamList[r.Title] = values;
                        //}
                        //else
                        //{
                        //    sqlParamList[r.Title] = table.First()[r.Title];
                        //}
                    }
                    else
                    {
                        //throw new Exception($"{blockEntity.ApiBodyId}缺少参数[{r.Title}]");
                    }
                }
            });
            return null;
        }
    }
}
