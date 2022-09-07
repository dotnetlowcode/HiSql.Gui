using HiSql.GUI.ApiModes.DataBase;
using HiSql.GUI.Repository.Models;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.BlockHandler
{
    /// <summary>
    /// 逻辑处理块
    /// </summary>
    public abstract class IBlockHandler
    {
        /// <summary>
        /// 处理块名字
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// 逻辑快执行
        /// </summary>
        /// <param name="blockEntity"></param>
        /// <param name="paramList"></param>
        /// <param name="globalParam"></param>
        /// <param name="blockResultMap"></param>
        /// <returns></returns>
        public abstract Task<BlockResult> HiApiBlockExcute(
                 HiApiBlockSimpleEntity blockEntity,
                 List<HiApiParamEntitySimple> paramList,
                 ExpandoObject globalParam,
                 Dictionary<string, List<IDictionary<string, object>>> blockResultMap);


    }
}
