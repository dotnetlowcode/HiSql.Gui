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
    public class ExcelBlockHandler : IBlockHandler
    {
        public string Title
        {
            get => throw new NotImplementedException();
            set => throw new NotImplementedException();
        }



        public override Task<BlockResult> HiApiBlockExcute(HiApiBlockSimpleEntity blockEntity, List<HiApiParamEntitySimple> paramList, ExpandoObject globalParam, Dictionary<string, List<IDictionary<string, object>>> blockResultMap)
        {
            throw new NotImplementedException();
        }
    }
}
